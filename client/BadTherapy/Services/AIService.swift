import Foundation

protocol AIServiceProtocol {
    func generateResponse(to message: String) async throws -> String
}

class AIService: AIServiceProtocol {
    private let baseURL = "http://localhost:8000"
    
    func generateResponse(to message: String) async throws -> String {
        guard let url = URL(string: "\(baseURL)/ai/generate") else {
            throw URLError(.badURL)
        }
        
        let requestBody = ["prompt": message]
        let jsonData = try JSONSerialization.data(withJSONObject: requestBody)
        
        var request = URLRequest(url: url)
        request.httpMethod = "POST"
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        request.httpBody = jsonData
        
        let (data, response) = try await URLSession.shared.data(for: request)
        
        guard let httpResponse = response as? HTTPURLResponse,
              httpResponse.statusCode == 200 else {
            throw URLError(.badServerResponse)
        }
        
        let result = try JSONDecoder().decode(AIResponse.self, from: data)
        return result.result
    }
}

private struct AIResponse: Codable {
    let result: String
} 