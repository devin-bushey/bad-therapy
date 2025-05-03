import Foundation

class AIService: AIServiceProtocol {
    private let baseURL = "http://localhost:8000"
    
    func generateResponse(to message: String, sessionId: String) async throws -> String {
        guard let url = URL(string: "\(baseURL)/ai/generate") else {
            throw URLError(.badURL)
        }
        
        let requestBody = ["prompt": message, "session_id": sessionId]
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

    func fetchSessions() async throws -> [ChatSession] {
        guard let url = URL(string: "\(baseURL)/sessions") else {
            throw URLError(.badURL)
        }
        
        let (data, response) = try await URLSession.shared.data(from: url)
        
        guard let httpResponse = response as? HTTPURLResponse,
              httpResponse.statusCode == 200 else {
            throw URLError(.badServerResponse)
        }
        
        return try JSONDecoder().decode([ChatSession].self, from: data)
    }

    func startNewSession(name: String) async throws -> ChatSession {
        guard let url = URL(string: "\(baseURL)/sessions") else {
            throw URLError(.badURL)
        }
        
        var request = URLRequest(url: url)
        request.httpMethod = "POST"
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        
        let sessionCreate = ["name": name]
        request.httpBody = try JSONSerialization.data(withJSONObject: sessionCreate)
        
        let (data, response) = try await URLSession.shared.data(for: request)
        
        guard let httpResponse = response as? HTTPURLResponse,
              httpResponse.statusCode == 200 else {
            throw URLError(.badServerResponse)
        }
        
        return try JSONDecoder().decode(ChatSession.self, from: data)
    }

    func sendMessage(prompt: String, sessionId: String, completion: @escaping (Result<String, Error>) -> Void) {
        guard let url = URL(string: "\(baseURL)/ai/generate") else { return }
        var request = URLRequest(url: url)
        request.httpMethod = "POST"
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        let body = AIRequest(prompt: prompt, session_id: sessionId)
        request.httpBody = try? JSONEncoder().encode(body)
        URLSession.shared.dataTask(with: request) { data, _, error in
            if let data = data {
                if let result = try? JSONDecoder().decode([String: String].self, from: data)["result"] {
                    completion(.success(result))
                } else {
                    completion(.failure(NSError(domain: "ParseError", code: 0)))
                }
            } else if let error = error {
                completion(.failure(error))
            }
        }.resume()
    }
}

private struct AIResponse: Codable {
    let result: String
}

struct AIRequest: Codable {
    let prompt: String
    let session_id: String
} 
