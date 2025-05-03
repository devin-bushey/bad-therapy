import SwiftUI

struct HomePage: View {
    @State private var selectedFeeling: Int? = nil
    let recentSessions = [
        (title: "Anxiety Check-in", subtitle: "Let's talk about what's making you feel anxio...", time: "2h ago"),
        (title: "Thought Reframing", subtitle: "Working on negative thought patterns...", time: "Yesterday")
    ]
    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(alignment: .leading, spacing: 20) {
                    // App Bar
                    HStack {
                        Text("Bad Therapy")
                            .font(.headline)
                        Spacer()
                        Image(systemName: "person.crop.circle")
                            .font(.title2)
                    }
                    // Greeting
                    Text("Hey, ready to vent?")
                        .font(.title2).fontWeight(.semibold)
                    Text("If your idea of therapy involves a highly questionable trust in AI and you’re mildly anxious, then Bad Therapy might be for you.")
                        .font(.subheadline)
                        .foregroundColor(.secondary)
                    // Action Cards
                    HStack(spacing: 16) {
                        NavigationLink(destination: ChatView()) {
                            CardButton(icon: "bubble.left.and.bubble.right", title: "New Chat", subtitle: "Start fresh")
                        }
                        NavigationLink(destination: Text("CBT Exercise")) {
                            CardButton(icon: "lightbulb", title: "CBT Exercise", subtitle: "Reframe thoughts")
                        }
                    }
                    // Recent Sessions
                    Text("Recent Sessions").font(.headline)
                    VStack(spacing: 10) {
                        ForEach(recentSessions, id: \ .title) { session in
                            SessionCard(title: session.title, subtitle: session.subtitle, time: session.time)
                        }
                    }
                }
                .padding()
            }
        }
    }
}

private struct CardButton: View {
    let icon, title, subtitle: String
    var body: some View {
        VStack(alignment: .leading, spacing: 6) {
            Image(systemName: icon)
                .font(.title)
                .foregroundColor(.blue)
            Text(title).font(.headline)
            Text(subtitle).font(.caption).foregroundColor(.secondary)
        }
        .padding()
        .frame(maxWidth: .infinity, minHeight: 80)
        .background(Color(UIColor.secondarySystemBackground))
        .cornerRadius(12)
    }
}

private struct SessionCard: View {
    let title, subtitle, time: String
    var body: some View {
        HStack {
            VStack(alignment: .leading, spacing: 4) {
                Text(title).font(.subheadline).fontWeight(.semibold)
                Text(subtitle).font(.caption).foregroundColor(.secondary).lineLimit(1)
            }
            Spacer()
            Text(time).font(.caption2).foregroundColor(.secondary)
        }
        .padding(10)
        .background(Color(UIColor.secondarySystemBackground))
        .cornerRadius(10)
    }
}

#Preview {
    HomePage()
} 
