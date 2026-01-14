import { AnalysisResult } from '../types';

export const mockAnalysis: AnalysisResult = {
    summary: "Conversation indicates a high probability of planning disruptive activities. Key indicators include references to 'riot police', 'demonstrations', and 'support structure'. Sentiment shows alignment with dissenting groups.",
    predictions: [
        {
            label: "Civil Unrest",
            score: 0.95,
            color: "#FF0000" // Red
        },
        {
            label: "Coordination",
            score: 0.88,
            color: "#FF8800" // Orange
        },
        {
            label: "Violence Potential",
            score: 0.45,
            color: "#FFFF00" // Yellow
        }
    ]
};
