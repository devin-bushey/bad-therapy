import Foundation
import SwiftUI
import BadTherapy

@MainActor
class ChatViewModel: ObservableObject {
    @Published private(set) var messages: [Message] = []
    @Published var userInput: String = ""
    @Published private(set) var currentSession: ChatSession?
    private let aiService: AIServiceProtocol
    
    init(aiService: AIServiceProtocol = AIService()) {
        self.aiService = aiService
    }
    
    func startNewSession(name: String) async {
        do {
            currentSession = try await aiService.startNewSession(name: name)
        } catch {
            print("Error starting new session: \(error)")
        }
    }
    
    func loadSession(id: String) async {
        do {
            currentSession = try await aiService.loadSession(id: id)
            messages = currentSession?.messages ?? []
        } catch {
            print("Error loading session: \(error)")
        }
    }
    
    func sendMessage() {
        guard !userInput.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty,
              let sessionId = currentSession?.id else { return }
        
        let userMessage = Message(content: userInput, isFromUser: true)
        messages.append(userMessage)
        let sentMessage = userInput
        userInput = ""
        
        Task {
            await generateAIResponse(to: sentMessage, sessionId: sessionId)
        }
    }
    
    private func generateAIResponse(to userMessage: String, sessionId: String) async {
        do {
            let response = try await aiService.generateResponse(to: userMessage, sessionId: sessionId)
            let aiMessage = Message(content: response, isFromUser: false)
            messages.append(aiMessage)
        } catch {
            print("Error generating AI response: \(error)")
            let errorMessage = Message(content: "I apologize, but I'm having trouble responding right now. Please try again.", isFromUser: false)
            messages.append(errorMessage)
        }
    }
} 
