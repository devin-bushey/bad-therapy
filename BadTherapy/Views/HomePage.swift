import SwiftUI

struct HomePage: View {
    @State private var showChat = false
    
    var body: some View {
        NavigationStack {
            VStack(spacing: 20) {
                Text("Bad Therapy")
                    .font(.largeTitle)
                    .fontWeight(.bold)
                
                Text("Your AI Therapist That Gives Bad Advice")
                    .font(.subheadline)
                    .foregroundColor(.secondary)
                    .multilineTextAlignment(.center)
                
                Spacer()
                
                NavigationLink(destination: ChatView()) {
                    Text("Start Session")
                        .font(.headline)
                        .foregroundColor(.white)
                        .frame(maxWidth: .infinity)
                        .padding()
                        .background(Color.blue)
                        .cornerRadius(10)
                }
                .padding(.horizontal)
            }
            .padding()
        }
    }
}

#Preview {
    HomePage()
} 