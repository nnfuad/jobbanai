'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'

export async function login(formData: FormData) {
  const supabase = await createClient()

  const data = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  }

  const { error } = await supabase.auth.signInWithPassword(data)

  if (error) {
    redirect(`/login?message=${encodeURIComponent(error.message)}`)
  }

  revalidatePath('/', 'layout')
  redirect('/')
}

import { Resend } from 'resend';
import { randomBytes } from 'crypto';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function signup(formData: FormData) {
  const supabase = await createClient()

  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  const name = formData.get('name') as string;

  // Generate 6-digit OTP safely
  const otp = Array.from(randomBytes(6))
    .map(byte => (byte % 10).toString())
    .join('');

  const expires_at = new Date(Date.now() + 10 * 60 * 1000).toISOString();

  const { error: dbError } = await supabase
    .from('otps')
    .insert([{ email, otp, name, password, expires_at }]);

  if (dbError) {
    console.error(dbError);
    redirect('/signup?message=Could not start signup process');
  }

  // Send email via Resend
  const { error: emailError } = await resend.emails.send({
    from: 'onboarding@resend.dev',
    to: email,
    subject: 'Your jobbanai verification code',
    html: `<p>Hi ${name},</p><p>Your verification code is <strong>${otp}</strong>. It expires in 10 minutes.</p>`,
  });

  if (emailError) {
    console.error(emailError);
    redirect('/signup?message=Could not send verification email');
  }

  redirect(`/signup/verify?email=${encodeURIComponent(email)}`);
}

export async function verifyOtpAndSignup(formData: FormData) {
  const supabase = await createClient()
  const email = formData.get('email') as string;
  const otp = formData.get('otp') as string;

  const { data, error } = await supabase
    .from('otps')
    .select('*')
    .eq('email', email)
    .eq('otp', otp)
    .gt('expires_at', new Date().toISOString())
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  if (error || !data) {
    redirect(`/signup/verify?email=${encodeURIComponent(email)}&message=Invalid or expired code`);
  }

  const { error: authError } = await supabase.auth.signUp({
    email: data.email,
    password: data.password,
    options: {
      data: {
        name: data.name,
      }
    }
  });

  if (authError) {
    console.error(authError);
    redirect('/signup?message=Could not create account');
  }

  // Cleanup OTPs for this email asynchronously
  supabase.from('otps').delete().eq('email', email).then();

  revalidatePath('/', 'layout')
  redirect('/')
}

export async function logout() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  revalidatePath('/', 'layout')
  redirect('/login')
}
