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
        mutationFn: async (data: ProfileForm) => {
            const token = await getAccessTokenSilently()
            return saveProfile({ data, token })
        },
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['profile'] })
    })

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setForm(f => ({ ...f, [e.target.name]: e.target.value }))
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
                        <input name="full_name" placeholder="Name" value={form.full_name} onChange={handleChange} className="profile-form-input" />
                        <input name="age" placeholder="Age" type="number" min={18} max={100} value={form.age} onChange={handleChange} className="profile-form-input" />
                        <input name="gender" placeholder="Gender" value={form.gender} onChange={handleChange} className="profile-form-input" />
                        <input name="ethnicity" placeholder="Ethnicity" value={form.ethnicity} onChange={handleChange} className="profile-form-input" />
                        <input name="goals" placeholder="Goals" value={form.goals} onChange={handleChange} className="profile-form-input" />
                        <input name="coaching_style" placeholder="Coaching Style" value={form.coaching_style} onChange={handleChange} className="profile-form-input" />
                        <input name="preferred_focus_area" placeholder="Preferred Focus Area" value={form.preferred_focus_area} onChange={handleChange} className="profile-form-input" />
                        <textarea name="bio" placeholder="Short bio" value={form.bio} onChange={handleChange} className="profile-form-textarea" />
                        <button type="submit" disabled={mutation.isPending} className="profile-form-save">Save</button>
                    </form>
                </div>
            </div>
        </div>
    )
} 