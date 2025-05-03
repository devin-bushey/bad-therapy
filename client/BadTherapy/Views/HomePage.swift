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
                        // App Logo & Title
                        HStack(spacing: 10) {
                            Image(systemName: "brain.head.profile")
                                .foregroundColor(Color.purple)
                                .font(.title)
                            Text("Bad Therapy")
                                .font(.title2)
                                .fontWeight(.bold)
                                .foregroundColor(Color.purple)
                        }
                        Spacer()
                        Image(systemName: "person.crop.circle")
                            .font(.title2)
                    }
                    // Greeting
                    Text("Hey, ready to vent?")
                        .font(.title2).fontWeight(.semibold)
                    Text("Your judgement-free AI therapist is here 24/7")
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

                    // Red Warning Card
                    VStack(alignment: .leading, spacing: 8) {
                        Text("Should you use this?")
                            .font(.headline)
                            .foregroundColor(.red)
                        Text("If you're battling real trauma, you need a human. Don't mess around with your mental health.")
                            .font(.subheadline)
                        Text("But if you're mildly anxious and your idea of therapy involves a highly questionable trust in AI, then Bad Therapy might be for you.")
                            .font(.caption).foregroundColor(.secondary)
                    }
                    .padding()
                    .background(Color.red.opacity(0.08))
                    .cornerRadius(12)
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
                .foregroundColor(.purple)
            Text(title).font(.headline).foregroundColor(.purple)
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
