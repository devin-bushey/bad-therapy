import Foundation
import SwiftUI

@MainActor
class ChatViewModel: ObservableObject {
    @Published private(set) var messages: [Message] = []
    @Published var userInput: String = ""
    private let aiService: AIServiceProtocol
    
    init(aiService: AIServiceProtocol = AIService()) {
        self.aiService = aiService
    }
    
    func sendMessage() {
        guard !userInput.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty else { return }
        
        let userMessage = Message(content: userInput, isFromUser: true)
        messages.append(userMessage)
        let sentMessage = userInput
        userInput = ""
        
        Task {
            await generateAIResponse(to: sentMessage)
        }
    }
    
    private func generateAIResponse(to userMessage: String) async {
        do {
            let response = try await aiService.generateResponse(to: userMessage)
            let aiMessage = Message(content: response, isFromUser: false)
            messages.append(aiMessage)
        } catch {
            print("Error generating AI response: \(error)")
            let errorMessage = Message(content: "I appologize, but I'm having trouble responding right now. Please try again.", isFromUser: false)
            messages.append(errorMessage)
        }
    }
} 