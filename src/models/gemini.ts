import 'dotenv/config'
import { GoogleGenerativeAI, Part } from '@google/generative-ai'
import { readFileSync } from 'node:fs'
import path from 'node:path';


const GEMINI_TOKEN = process.env.GEMINI_API_KEY || ''

const genAI = new GoogleGenerativeAI(GEMINI_TOKEN)
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })
const starterPrompt = `
        You are an expert in prompt crafting.
        Use the text input to craft a detailed prompt for image generation.
        Keep the prompt length under 900 characters: `

async function makeImagePrompt(userPrompt: string) {
    const prompt = `
        ${starterPrompt}
        ${userPrompt}
    `
    const { stream } = await model.generateContentStream(prompt)
    return stream;
}
// text generation
async function generateText(prompt: string) {
    const result = await model.generateContent(prompt)
    const response = result.response
    const text = response.text()
    console.log(text)
    return text;
}

// generate text streams
async function generateTextStream(prompt: string) {
    const { stream } = await model.generateContentStream(prompt)
    let responseText = '';
    for await(const chunk of stream) {
        const chunkText = chunk.text();
        responseText += chunkText;
        process.stdout.write(chunkText)
    }

    return responseText
}

// Analyze an image
const imgPrompt: string = 'Describe this photo'
const imageRoot = path.join(__dirname, '..', 'public', 'assets', 'images')
const image = photoToAnalyze(path.join(imageRoot, 'hf-image-stable.jpg'), 'image/jpeg')

function photoToAnalyze(path: string, mimeType: string) {
    return {
        inlineData: {
            data: Buffer.from(readFileSync(path)).toString('base64'),
            mimeType,
        },
    };
}

async function analyzeImage(image: Part, prompt: string) {
    const { response } = await model.generateContent([prompt, image])
    const responseText = response.text()
    console.log(responseText)
    return responseText;
}

// analyzeImage(image, imgPrompt); // this hallucinated a bit and said the image was from a CS Lewis book and NOT a Tolkien book.

export { generateText, generateTextStream, analyzeImage, makeImagePrompt }

/**
 * SOME NOTES ON LIMITATIONS FOR THE GEMINI API (this was partially generated by co-pilot autocomplete 🤷🏻‍♂️)
 * The Gemini API is primarily focused on text-based tasks and does not currently offer text-to-image capabilities. 
 * While it can analyze and understand images, it doesn't have the functionality to create images based on text descriptions.
 * If you're looking for text-to-image conversion, there are plenty of models (see the other ts files in this directory).

 * PROMPT: 'Does the gemini API allow for text-to-image conversion?'
 * RESULT:
 * the Gemini API does not currently offer text-to-image conversion capabilities. 

The Gemini API is primarily focused on text-based tasks like:

* Text generation (stories, articles, poems, code, etc.)
* Text summarization
* Text translation
* Question answering
* Code generation 

While it can analyze and understand images, it doesn't have the functionality to create images based on text descriptions.
 */

/**
 * PROMPT: 'Are there other Goolge AI services that allow for text-to-image conversion?' 
 * TLDR: No. Google can analyze and generate text about the image, but you're better suited using other tools for text-to-image conversion.
 * RESULT:
 * Google does offer other AI services that can be used in conjunction with other tools to achieve similar results:

* **Google Cloud Vision API:** This API provides image analysis and understanding capabilities, including object detection, face detection, and landmark identification. While it doesn't directly generate images from text, you could use it to analyze and modify existing images based on textual descriptions.
* **Google AI Platform:** This platform allows you to build and deploy your own machine learning models. You could leverage pre-trained models or build your own for text-to-image generation, but it would require significant technical expertise.
* **Google Magenta:**  This project focuses on the creation of music and art using AI. While it's not specifically focused on text-to-image, some of their tools and models might be adaptable for this purpose.

It's worth noting that Google is actively researching and developing new AI tools, so it's possible they will release a dedicated text-to-image service in the future. 
 */

