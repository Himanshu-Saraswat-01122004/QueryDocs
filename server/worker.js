import { Worker } from "bullmq";
import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import { QdrantVectorStore } from "@langchain/qdrant";
import { Document } from "@langchain/core/documents";
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { QdrantClient } from "@qdrant/js-client-rest";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";

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
            const doc = docs[i];
            // Split the document into chunks
            const chunks = await textSplitter.splitDocuments([doc]);
            allChunks = allChunks.concat(chunks);
            // console.log(`Document ${i + 1} split into ${chunks.length} chunks`);
            // Print each chunk (limit to first 50 chars for readability)
            // chunks.forEach((chunk, idx) => {
            //     console.log(`--- Chunk ${idx + 1} ---`);
            //     console.log(`Metadata: ${JSON.stringify(chunk.metadata)}`);
            //     console.log(`Content preview: ${chunk.pageContent.substring(0, 50)}...`);
            //     console.log(`Chunk length: ${chunk.pageContent.length} characters`);
            // });
        }
        
        console.log(`Total chunks created: ${allChunks.length}`);

        // Embed and store chunks in Qdrant
        const embeddings = new GoogleGenerativeAIEmbeddings({
            apiKey: "AIzaSyCSSH8weHRJjhdSzuiMdFZOANTMybGPTms",
            modelName: "models/embedding-001"
        });
        
        // Correct initialization: documents as first argument, embeddings as second
        const vectorStore = await QdrantVectorStore.fromDocuments(
            allChunks,  // First argument should be the documents
            embeddings,  // Second argument should be the embeddings
            {
                client,
                collectionName: "pdf-docs",
            }
        );
        
        console.log("Chunks embedded and stored in Qdrant vector store.");
        return { status: "success", chunksCount: allChunks.length };
    } catch (error) {
        console.error("Error processing PDF:", error);
        throw error;
    }
}, {
    concurrency: 100, 
    connection: {
        host: "localhost",
        port: 6379
    }
});

console.log("PDF processing worker started and waiting for jobs...");

