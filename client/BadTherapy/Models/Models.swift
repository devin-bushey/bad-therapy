import Foundation

struct ChatSession: Identifiable, Codable {
    let id: String
    let name: String
    let created_at: String
    
    enum CodingKeys: String, CodingKey {
        case id
        case name
        case created_at
    }
}

struct Message: Identifiable {
    let id = UUID()
    let content: String
    let isFromUser: Bool
}

protocol AIServiceProtocol {
    func generateResponse(to message: String, sessionId: String) async throws -> String
    func startNewSession(name: String) async throws -> ChatSession
    func fetchSessions() async throws -> [ChatSession]
} 