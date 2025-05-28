'use client'
import * as React from 'react'
import { Upload, FileText, CheckCircle } from 'lucide-react'

const FileUpload: React.FC = () => {
    const [isUploading, setIsUploading] = React.useState(false);
    const [uploadSuccess, setUploadSuccess] = React.useState(false);
    const [fileName, setFileName] = React.useState('');

    const handleFileUpload = () => {
        const element = document.createElement('input');
        element.setAttribute('type', 'file');
        element.setAttribute('accept', 'application/pdf');
        element.addEventListener('change', async (event) => {
            const file = (event.target as HTMLInputElement).files?.[0];
            if (file) {
                setIsUploading(true);
                setUploadSuccess(false);
                setFileName(file.name);
                
                try {
                    const formData = new FormData();
                    formData.append('pdf', file);
                    await fetch('http://localhost:4001/upload', {
                        method: 'POST',
                        body: formData
                    });
                    
                    setUploadSuccess(true);
                    setTimeout(() => setUploadSuccess(false), 3000);
                } catch (error) {
                    console.error('Error uploading file:', error);
                } finally {
                    setIsUploading(false);
                }
            }
        });
        element.click();
    }

    return (
        <div className="flex flex-col gap-3">
            {/* Main upload button */}
            <button 
                onClick={handleFileUpload} 
                disabled={isUploading}
                className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-4 rounded-lg shadow-md flex items-center justify-center gap-3 hover:from-indigo-700 hover:to-purple-700 transition-all transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-70 disabled:cursor-wait w-full"
            >
                {isUploading ? (
                    <>
                        <div className="h-5 w-5 rounded-full border-2 border-white border-t-transparent animate-spin"></div>
                        <span className="font-medium">Uploading...</span>
                    </>
                ) : (
                    <>
                        <Upload className="text-white" size={22} />
                        <span className="font-medium">Upload PDF Document</span>
                    </>
                )}
            </button>
            
            {/* Success message */}
            {uploadSuccess && (
                <div className="flex items-center gap-2 text-green-400 bg-green-500/10 p-2 rounded-md border border-green-500/20">
                    <CheckCircle size={16} />
                    <span className="text-sm">Successfully uploaded <span className="font-medium">{fileName}</span></span>
                </div>
            )}
            
            {/* Quick note/help text */}
            <div className="mt-2 p-3 bg-slate-800/40 rounded-lg border border-slate-700">
                <div className="flex items-center gap-2 mb-2">
                    <FileText size={16} className="text-indigo-400" />
                    <span className="text-sm font-medium text-slate-300">Document tips</span>
                </div>
                <ul className="text-xs text-slate-400 space-y-1 ml-6 list-disc">
                    <li>Upload PDF documents to analyze</li>
                    <li>Maximum file size: 10MB</li>
                    <li>Text-based PDFs work best</li>
                </ul>
            </div>
        </div>
    )
}

export default FileUpload;