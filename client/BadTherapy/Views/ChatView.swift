import SwiftUI

// MARK: - ChatView
struct ChatView: View {
    @StateObject private var viewModel = ChatViewModel()
    @State private var isEditingName = false
    @State private var editedName = ""
    let sessionId: String?
    let onDisappear: () async -> Void
    
    var body: some View {
        VStack {
            // Session Name Header
            HStack {
                if isEditingName {
                    HStack {
                        TextField("Session Name", text: $editedName)
                            .textFieldStyle(RoundedBorderTextFieldStyle())
                        Button("Save") {
                            Task {
                                do {
                                    try await AIService().renameSession(sessionId: viewModel.currentSession?.id ?? "", newName: editedName)
                                    if let sessionId = viewModel.currentSession?.id {
                                        await viewModel.loadSession(id: sessionId)
                                    }
                                    isEditingName = false
                                } catch {
                                    print("Error renaming session: \(error)")
                                }
                            }
                        }
                        .buttonStyle(.bordered)
                    }
                } else {
                    Text(viewModel.currentSession?.name ?? "New Chat")
                        .font(.headline)
                    Button(action: {
                        editedName = viewModel.currentSession?.name ?? ""
                        isEditingName = true
                    }) {
                        Image(systemName: "pencil")
                            .font(.caption)
                            .foregroundColor(.secondary)
                    }
                }
                Spacer()
            }
            .padding(.horizontal)
            
            ScrollView {
                LazyVStack(spacing: 12) {
                    ForEach(viewModel.messages) { message in
                        MessageBubble(message: message)
                    }
                }
                .padding()
            }
            
            HStack {
                TextField("Type a message...", text: $viewModel.userInput)
                    .textFieldStyle(RoundedBorderTextFieldStyle())
                    .padding(.horizontal)
                
                Button(action: {
                    viewModel.sendMessage()
                }) {
                    Image(systemName: "arrow.up.circle.fill")
                        .font(.title)
                }
                .disabled(viewModel.userInput.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty)
                .padding(.trailing)
            }
            .padding(.vertical, 8)
            .background(Color(.systemBackground))
            .shadow(radius: 2)
        }
        .navigationBarTitleDisplayMode(.inline)
        .onAppear {
            Task {
                if let sessionId = sessionId {
                    await viewModel.loadSession(id: sessionId)
                } else {
                    await viewModel.startNewSession(name: "New Chat")
                }
            }
        }
        .onDisappear {
            Task {
                await onDisappear()
            }
        }
    }
}

// MARK: - MessageBubble
private struct MessageBubble: View {
    let message: Message
    
    var body: some View {
        HStack {
            if message.isFromUser {
                Spacer()
            }
            
            Text(message.content)
                .padding(12)
                .background(message.isFromUser ? Color.blue : Color(.systemGray5))
                .foregroundColor(message.isFromUser ? .white : .primary)
                .cornerRadius(16)
            
            if !message.isFromUser {
                Spacer()
            }
        }
    }
}

// MARK: - Preview
#Preview {
    NavigationStack {
        ChatView(sessionId: nil) {
            // Placeholder for onDisappear
        }
    }
} 
