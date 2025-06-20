import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuth0 } from '@auth0/auth0-react'
import Navbar from '../../pages/Navbar'
import { fetchProfile, saveProfile } from './services/profileService'
import type { ProfileForm } from '../../types/profile.types'

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
        <div className="min-h-screen bg-warm-50 w-full overflow-x-hidden">
            <Navbar />
            <div className="flex flex-col items-center justify-center min-h-[calc(100vh-80px)] px-6 py-6 box-border w-full">
                <div className="bg-warm-100 border border-warm-200 rounded-3xl shadow-lg p-10 max-w-md w-full flex flex-col items-center">
                    <h2 className="text-warm-800 font-bold text-3xl mb-5 text-center">Your Profile</h2>
                    <p className="text-warm-600 text-base -mt-2.5 mb-5 text-center">
                        All fields are optional. Any updates to your profile will be used in new conversations. All of your data and conversations are securely stored and encrypted.
                    </p>
                    <form onSubmit={handleSubmit} className="w-full flex flex-col gap-4 min-h-[520px]">
                        {mutation.isError && <div className="text-error-500 font-medium mt-1">Error saving profile</div>}
                        {mutation.isSuccess && <div className="text-success-500 font-medium mt-1">Profile saved</div>}
                        {mutation.isPending && <div className="text-ai-500 font-medium mt-1">Saving...</div>}
                        {isLoading ? (<div className="text-ai-500 font-medium mt-1">Loading profile...</div>) : (<>
                            <label htmlFor="full_name" className="text-warm-800 font-medium text-sm">Name</label>
                            <input 
                                id="full_name" 
                                name="full_name" 
                                placeholder="Name" 
                                value={form.full_name} 
                                onChange={handleChange} 
                                className="bg-warm-50 text-warm-800 border border-warm-300 rounded-lg p-3 text-base mb-0.5 focus:outline-none focus:ring-2 focus:ring-earth-500 focus:border-earth-500" 
                            />
                            <label htmlFor="age" className="text-warm-800 font-medium text-sm">Age</label>
                            <input 
                                id="age" 
                                name="age" 
                                placeholder="Age" 
                                type="number" 
                                min={18} 
                                max={100} 
                                value={form.age} 
                                onChange={handleChange} 
                                className="bg-warm-50 text-warm-800 border border-warm-300 rounded-lg p-3 text-base mb-0.5 focus:outline-none focus:ring-2 focus:ring-earth-500 focus:border-earth-500" 
                            />
                            <label htmlFor="gender" className="text-warm-800 font-medium text-sm">Gender</label>
                            <input 
                                id="gender" 
                                name="gender" 
                                placeholder="Gender" 
                                value={form.gender} 
                                onChange={handleChange} 
                                className="bg-warm-50 text-warm-800 border border-warm-300 rounded-lg p-3 text-base mb-0.5 focus:outline-none focus:ring-2 focus:ring-earth-500 focus:border-earth-500" 
                            />
                            <label htmlFor="ethnicity" className="text-warm-800 font-medium text-sm">Ethnicity</label>
                            <input 
                                id="ethnicity" 
                                name="ethnicity" 
                                placeholder="Ethnicity" 
                                value={form.ethnicity} 
                                onChange={handleChange} 
                                className="bg-warm-50 text-warm-800 border border-warm-300 rounded-lg p-3 text-base mb-0.5 focus:outline-none focus:ring-2 focus:ring-earth-500 focus:border-earth-500" 
                            />
                            <label htmlFor="coaching_style" className="text-warm-800 font-medium text-sm">Coaching Style</label>
                            <select
                                id="coaching_style"
                                name="coaching_style"
                                value={form.coaching_style}
                                onChange={handleChange}
                                className="bg-warm-50 text-warm-800 border border-warm-300 rounded-lg p-3 text-base mb-0.5 focus:outline-none focus:ring-2 focus:ring-earth-500 focus:border-earth-500"
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
                            <label htmlFor="bio" className="text-warm-800 font-medium text-sm">Short bio</label>
                            <textarea 
                                id="bio" 
                                name="bio" 
                                placeholder="Short bio" 
                                value={form.bio} 
                                onChange={handleChange} 
                                className="bg-warm-50 text-warm-800 border border-warm-300 rounded-lg p-3 text-base mb-0.5 min-h-20 resize-y focus:outline-none focus:ring-2 focus:ring-earth-500 focus:border-earth-500" 
                            />
                            <button 
                                type="submit" 
                                disabled={mutation.isPending} 
                                className="bg-earth-500 text-warm-50 border-none rounded-lg py-3 px-0 font-bold text-lg mt-2 cursor-pointer shadow-sm hover:bg-earth-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Save
                            </button>
                        </>)}
                    </form>
                </div>
            </div>
        </div>
    )
} 