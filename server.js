const { PrismaClient } = require('./generated/prisma')
const express = require('express');
const cors = require('cors');
require('dotenv').config();
const prisma = new PrismaClient()
const app = express();

app.use(cors());
app.use(express.json());


class AIService {
  constructor() {
    this.groqApiKey = process.env.GROQ_API_KEY;

  }

  async AILAYER(prompt) {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.groqApiKey}`
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [
          {
            role: 'system',
            content: 'You are a website structure expert. Generate complete page structures with sections in JSON format only.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 4000,
        response_format: { type: 'json_object' },

      })
    });

    if (!response.ok) {
      throw new Error(`Groq API error: ${response.statusText}`);
    }
    const data = await response.json();
    const content = data.choices[0].message.content;
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    return JSON.parse(jsonMatch ? jsonMatch[0] : content);
  }

  async generateWebsiteStructure(userPrompt, selectedNoOfPages, selectedLanguagee) {
    const systemPrompt = `Based on the user's description, generate a complete website structure with ${selectedNoOfPages}, each containing relevant sections from the available pattern library.

User request: ${userPrompt} with ${selectedNoOfPages} pages in ${selectedLanguagee} 

AVAILABLE SECTIONS IN PATTERN LIBRARY (you can ONLY use these):
- Navbar
- Header
- Mega Menu
- Mobile App Menu
- Hero
- About Us
- Why Choose Us
- Services
- Features
- Metrics
- Gallery
- Portfolio
- Blog
- Pricing Table
- Team
- Testimonial
- Company Logo
- Contact Form
- FAQ
- Location
- CTA
- Breadcrumbs
- Footer
- 404
- Coming Soon
- Under Maintenance


Respond with ONLY valid JSON in this exact format (no markdown, no explanation):
{
  "projectName": "Project name based on description",
  "websiteType": "type of website",
  "pages": [
    {
      "id": "page-1",
      "name": "Home",
      "description": "Brief description of this page's purpose",
      "sections": [
        {
          "id": "unique-section-id",
          "name": "Section name from pattern library (exactly as listed above)",
          "description": "Brief description of how this section will be used for this specific page (2-3 sentences max)"
        }
      ]
    },
    {
      "id": "page-2",
      "name": "Services",
      "description": "Brief description of this page's purpose",
      "sections": [
        {
          "id": "unique-section-id",
          "name": "Section name from pattern library",
          "description": "Brief description of how this section will be used"
        }
      ]
    }
  ]
}

IMPORTANT RULES:
1. Create logical pages based on the website type and given ${selectedNoOfPages}.
2. Each page should have 3-5 relevant sections from the pattern library.
3. Use the EXACT section names as shown in the library.
4. Always include a Home page with Navbar, Hero, and Footer.
5. Sections should be distributed logically across pages.
6. Write descriptions specific to each page and section.
7. Do NOT create custom section names - only use ones from the library.
8. Ensure sections are appropriate for each page's purpose.
9. Always give output in the required/asked language such as ${selectedLanguagee}

Example for a restaurant with 3 pages:
- Home page: Navbar, Hero, About Us, Services, Footer
- Menu page: Navbar, Pricing Table, Gallery, Footer  
- Contact page: Navbar, Location, Contact Form, Footer`;

    if (this.groqApiKey) {
      try {
        return await this.AILAYER(systemPrompt);
      } catch (error) {
        console.log('Groq failed', error.message);
      }
    }
    throw new Error('Please add API KEY in .env');
  }
}
app.post('/api/generate-structure', async (req, res) => {
  try {
    const { prompt, pages, language } = req.body;

    if (!prompt || typeof prompt !== 'string') {
      return res.status(400).json({
        error: 'Invalid request',
        message: 'Prompt is required and must be a string'
      });
    }
    const AILayer = new AIService();
    if (!AILayer.groqApiKey) {
      return res.status(500).json({
        error: 'Configuration error',
        message: 'AI API key not configured. Please set GROQ_API_KEY in .env file'
      });
    }

    console.log('Generating website structure with AI...');
    const structure = await AILayer.generateWebsiteStructure(prompt, pages, language);

    if (!structure.pages || !Array.isArray(structure.pages)) {
      throw new Error('Invalid response from AI: Missing pages array');
    }
    res.json({
      success: true,
      projectName: structure.projectName,
      websiteType: structure.websiteType,
      pages: structure.pages,
      meta: {
        totalPages: structure.pages.length,
        totalSections: structure.pages.reduce((sum, page) => sum + (page.sections ? page.sections.length : 0), 0),
        generatedAt: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Error generating structure:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error.message,
      meta: {
        generatedAt: new Date().toISOString()
      }

    });
  }
});


app.post('/api/save-sitemap', async(req,res)=>{

try {
  const {  projectName, nodes, edges, prompt, language,} = req.body
  const newSitemap = await prisma.sitemap.create({
    data:{
      projectName,edges,nodes,language,prompt
    }
  })
    res.status(200).json({ message: 'Sitemap saved successfully', sitemap: newSitemap })
} catch (error) {
   console.error('Error saving sitemap:', error)
    res.status(500).json({ error: 'Failed to save sitemap' })
}

})

app.get('/api/sitemaps', async(req,res)=>{
  try {
    const allSitemaps = await prisma.sitemap.findMany({
      orderBy:{createdAt:'desc'}
    })
    res.status(200).json(allSitemaps)
  } catch (error) {
       console.error('Error loading sitemaps:', error)
        res.status(500).json({ error: 'Failed to load sitemaps' })
  }
})

app.get('/api/sitemaps/:id',async(req,res)=>{
 try {
   const {id} = req.params
   const findSitemap = await prisma.sitemap.findUnique({
     where:{id:String(id)}
   })
     if (!findSitemap) {
       return res.status(404).json({ error: 'Sitemap not found' })
     }
   res.status(200).json(findSitemap)
 } catch (error) {
     console.error('Error fetching sitemap:', error)
    res.status(500).json({ error: 'Failed to fetch sitemap' })
 }
})
const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log("server running on ", PORT)
});

module.exports = app;