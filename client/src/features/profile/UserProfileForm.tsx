import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuth0 } from '@auth0/auth0-react'
import Navbar from '../../pages/Navbar'
import { fetchProfile, saveProfile } from './services/profileService'
import type { ProfileForm } from '../../types/profile.types'
import './UserProfileForm.css'

export default function UserProfileForm() {
    const queryClient = useQueryClient()
    const { getAccessTokenSilently } = useAuth0()
    const [form, setForm] = useState<ProfileForm>({ full_name: '', age: '', bio: '', gender: '', ethnicity: '', goals: '', coaching_style: '', preferred_focus_area: '' })
    const [initialized, setInitialized] = useState(false)

    const { isLoading } = useQuery({
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
        mutationFn: async (data: ProfileForm) => {
            const token = await getAccessTokenSilently()
            return saveProfile({ data, token })
        },
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['profile'] })
    })

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => setForm(f => ({ ...f, [e.target.name]: e.target.value }))
    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        mutation.mutate(form)
    }
    return (
        <div className="profile-form-bg">
            <Navbar />
            <div className="profile-form-outer">
                <div className="profile-form-inner">
                    <h2 className="profile-form-title">Your Profile</h2>
                    <p className="profile-form-desc">
                        All fields are optional. Any updates to your profile will be used in new conversations. All of your data and conversations are securely stored and encrypted.
                    </p>
                    <form onSubmit={handleSubmit} className="profile-form">
                        {mutation.isError && <div className="profile-form-error">Error saving profile</div>}
                        {mutation.isSuccess && <div className="profile-form-success">Profile saved</div>}
                        {mutation.isPending && <div className="profile-form-pending">Saving...</div>}
                        {isLoading ? (<div className="profile-form-pending">Loading profile...</div>) : (<>
                            <label htmlFor="full_name" className="profile-form-label">Name</label>
                            <input id="full_name" name="full_name" placeholder="Name" value={form.full_name} onChange={handleChange} className="profile-form-input" />
                            <label htmlFor="age" className="profile-form-label">Age</label>
                            <input id="age" name="age" placeholder="Age" type="number" min={18} max={100} value={form.age} onChange={handleChange} className="profile-form-input" />
                            <label htmlFor="gender" className="profile-form-label">Gender</label>
                            <input id="gender" name="gender" placeholder="Gender" value={form.gender} onChange={handleChange} className="profile-form-input" />
                            <label htmlFor="ethnicity" className="profile-form-label">Ethnicity</label>
                            <input id="ethnicity" name="ethnicity" placeholder="Ethnicity" value={form.ethnicity} onChange={handleChange} className="profile-form-input" />
                            <label htmlFor="coaching_style" className="profile-form-label">Coaching Style</label>
                            <select
                                id="coaching_style"
                                name="coaching_style"
                                value={form.coaching_style}
                                onChange={handleChange}
                                className="profile-form-input"
                            >
                                <option value="">Select Coaching Style</option>
                                <option value="CBT">Cognitive Behavioral Therapy (CBT)</option>
                                <option value="ACT">Acceptance and Commitment Therapy (ACT)</option>
                                <option value="DBT">Dialectical Behavior Therapy (DBT)</option>
                                <option value="Psychodynamic">Psychodynamic</option>
                                <option value="Humanistic">Humanistic</option>
                                <option value="Mindfulness">Mindfulness-Based</option>
                                <option value="Solution-Focused">Solution-Focused</option>
                                <option value="Coaching">Coaching</option>
                            </select>
                            <label htmlFor="bio" className="profile-form-label">Short bio</label>
                            <textarea id="bio" name="bio" placeholder="Short bio" value={form.bio} onChange={handleChange} className="profile-form-textarea" />
                            <button type="submit" disabled={mutation.isPending} className="profile-form-save">Save</button>
                        </>)}
                    </form>
                </div>
            </div>
        </div>
    )
} 