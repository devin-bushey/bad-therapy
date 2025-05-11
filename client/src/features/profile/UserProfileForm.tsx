import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuth0 } from '@auth0/auth0-react'
import Navbar from '../dashboard/components/Navbar'
import { fetchProfile, saveProfile } from './services/profileService'

export default function UserProfileForm() {
    const queryClient = useQueryClient()
    const { getAccessTokenSilently } = useAuth0()
    const [form, setForm] = useState({ full_name: '', age: '', bio: '', gender: '', ethnicity: '', goals: '', coaching_style: '', preferred_focus_area: '' })
    const [initialized, setInitialized] = useState(false)

    useQuery({
        queryKey: ['profile'],
        queryFn: async () => {
            const token = await getAccessTokenSilently()
            const data = await fetchProfile(token)
            if (data && !initialized) {
                setForm({
                    full_name: data.full_name || '',
                    age: data.age || '',
                    bio: data.bio || '',
                    gender: data.gender || '',
                    ethnicity: data.ethnicity || '',
                    goals: data.goals || '',
                    coaching_style: data.coaching_style || '',
                    preferred_focus_area: data.preferred_focus_area || ''
                })
                setInitialized(true)
            }
            return data
        }
    })

    const mutation = useMutation({
        mutationFn: async (data: any) => {
            const token = await getAccessTokenSilently()
            return saveProfile({ data, token })
        },
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['profile'] })
    })

    const handleChange = (e: any) => setForm(f => ({ ...f, [e.target.name]: e.target.value }))
    const handleSubmit = (e: any) => {
        e.preventDefault()
        mutation.mutate(form)
    }
    return (
        <div style={{ minHeight: '100vh', background: '#181824' }}>
            <Navbar />
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 'calc(100vh - 80px)' }}>
                <div style={{ background: '#23233a', borderRadius: 24, boxShadow: '0 2px 12px #0002', padding: '2.5rem 2.5rem 2rem 2.5rem', maxWidth: 420, width: '100%', border: '1.5px solid #2563eb', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <h2 style={{ color: '#fff', fontWeight: 700, fontSize: 28, marginBottom: 18 }}>Your Profile</h2>
                    <p style={{ color: '#a3a3a3', fontSize: 15, marginTop: -10, marginBottom: 18, textAlign: 'center' }}>
                        All fields are optional. Any updates to your profile will be used in new conversations. Your data is securely stored and encrypted.
                    </p>
                    <form onSubmit={handleSubmit} style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 18 }}>
                        <input name="full_name" placeholder="Name" value={form.full_name} onChange={handleChange} style={{ background: '#181824', color: '#fff', border: '1.5px solid #444', borderRadius: 10, padding: '0.8em 1em', fontSize: 16, marginBottom: 2 }} />
                        <input name="age" placeholder="Age" type="number" min={18} max={100} value={form.age} onChange={handleChange} style={{ background: '#181824', color: '#fff', border: '1.5px solid #444', borderRadius: 10, padding: '0.8em 1em', fontSize: 16, marginBottom: 2 }} />
                        <input name="gender" placeholder="Gender" value={form.gender} onChange={handleChange} style={{ background: '#181824', color: '#fff', border: '1.5px solid #444', borderRadius: 10, padding: '0.8em 1em', fontSize: 16, marginBottom: 2 }} />
                        <input name="ethnicity" placeholder="Ethnicity" value={form.ethnicity} onChange={handleChange} style={{ background: '#181824', color: '#fff', border: '1.5px solid #444', borderRadius: 10, padding: '0.8em 1em', fontSize: 16, marginBottom: 2 }} />
                        <input name="goals" placeholder="Goals" value={form.goals} onChange={handleChange} style={{ background: '#181824', color: '#fff', border: '1.5px solid #444', borderRadius: 10, padding: '0.8em 1em', fontSize: 16, marginBottom: 2 }} />
                        <input name="coaching_style" placeholder="Coaching Style" value={form.coaching_style} onChange={handleChange} style={{ background: '#181824', color: '#fff', border: '1.5px solid #444', borderRadius: 10, padding: '0.8em 1em', fontSize: 16, marginBottom: 2 }} />
                        <input name="preferred_focus_area" placeholder="Preferred Focus Area" value={form.preferred_focus_area} onChange={handleChange} style={{ background: '#181824', color: '#fff', border: '1.5px solid #444', borderRadius: 10, padding: '0.8em 1em', fontSize: 16, marginBottom: 2 }} />
                        <textarea name="bio" placeholder="Short bio" value={form.bio} onChange={handleChange} style={{ background: '#181824', color: '#fff', border: '1.5px solid #444', borderRadius: 10, padding: '0.8em 1em', fontSize: 16, minHeight: 80, resize: 'vertical', marginBottom: 2 }} />
                        <button type="submit" disabled={mutation.isPending} style={{ background: '#2563eb', color: '#fff', border: 'none', borderRadius: 10, padding: '0.9em 0', fontWeight: 700, fontSize: 18, marginTop: 8, cursor: 'pointer', boxShadow: '0 2px 8px #0002' }}>Save</button>
                        {mutation.isError && <div style={{ color: '#ef4444', fontWeight: 500, marginTop: 4 }}>Error saving profile</div>}
                        {mutation.isSuccess && <div style={{ color: '#22c55e', fontWeight: 500, marginTop: 4 }}>Profile saved</div>}
                    </form>
                </div>
            </div>
        </div>
    )
} 