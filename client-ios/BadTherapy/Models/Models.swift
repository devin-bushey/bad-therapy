import Foundation

struct ChatSession: Identifiable, Codable {
    let id: String
    let name: String
    let created_at: String
    let messages: [Message]?
    
    enum CodingKeys: String, CodingKey {
        case id
        case name
        case created_at
        case messages
    }
}

struct Message: Identifiable, Codable {
    let id = UUID()
    let content: String
    let isFromUser: Bool
}

protocol AIServiceProtocol {
    func generateResponse(to message: String, sessionId: String) async throws -> String
    func startNewSession(name: String) async throws -> ChatSession
    func fetchSessions() async throws -> [ChatSession]
    func renameSession(sessionId: String, newName: String) async throws
    func loadSession(id: String) async throws -> ChatSession
}
