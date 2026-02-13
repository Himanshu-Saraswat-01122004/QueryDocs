import { Worker } from "bullmq";
import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import { QdrantVectorStore } from "@langchain/qdrant";
import { Document } from "@langchain/core/documents";
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { QdrantClient } from "@qdrant/js-client-rest";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import dotenv from "dotenv";

dotenv.config();

const client = new QdrantClient({ url: `http://localhost:6333` });

const worker = new Worker("pdf-queue", async (job) => {
    try {
        console.log(`Processing job:`, job.data);
        const data = JSON.parse(job.data);
        console.log(`Loading PDF from: ${data.path}`);

        // Load the PDF document
        const loader = new PDFLoader(data.path);
        const docs = await loader.load();

        // Create text splitter for chunking
        const textSplitter = new RecursiveCharacterTextSplitter({
            chunkSize: 1000,
            chunkOverlap: 200
        });

        // Process each document and chunk them
        let allChunks = [];
        for (let i = 0; i < docs.length; i++) {
            console.log(`Processing document ${i + 1}/${docs.length}`);
            const chunks = await textSplitter.splitDocuments([docs[i]]);
            allChunks = allChunks.concat(chunks);
        }

        console.log(`Total chunks created: ${allChunks.length}`);

        // Initialize embeddings
        const embeddings = new GoogleGenerativeAIEmbeddings({
            apiKey: process.env.GOOGLE_API_KEY,
            modelName: "models/gemini-embedding-001"
        });

        // Embed and store chunks in Qdrant
        const vectorStore = await QdrantVectorStore.fromDocuments(
            allChunks,
            embeddings,
            {
                client,
                collectionName: "pdf-docs",
            }
        );

        console.log(`Successfully embedded and stored ${allChunks.length} chunks in Qdrant.`);
        return { status: "success", chunksCount: allChunks.length };
    } catch (error) {
        console.error("Error processing PDF:", error);
        throw error;
    }
}, {
    concurrency: 1,
    connection: {
        host: "localhost",
        port: 6379
    }
});

console.log("PDF processing worker started and waiting for jobs...");
