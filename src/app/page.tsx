'use client';

import { useRef } from 'react';

import { useRouter } from 'next/navigation';

import { InferRequestType, InferResponseType } from 'hono';
import { toast } from 'sonner';

import { useMutation } from '@tanstack/react-query';

import { client } from '@/api';

export default function Home() {
  const router = useRouter();
  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);
  const nameRef = useRef<HTMLInputElement>(null);

  const login = client.api.auth.login.$post;
  const loginMutation = useMutation<
    InferResponseType<typeof login>,
    Error,
    InferRequestType<typeof login>['json']
  >({
    mutationFn: async json => {
      const res = await login({ json });
      if (res.ok) {
        toast.success('Logged in successfully');
        return await res.json();
      }
      throw new Error((await res.json()).message || 'Failed to login');
    },
    mutationKey: ['auth', 'login'],
  });

  const register = client.api.auth.register.$post;
  const registerMutation = useMutation<
    InferResponseType<typeof register>,
    Error,
    InferRequestType<typeof register>['json']
  >({
    mutationFn: async json => {
      const res = await register({ json });
      if (res.ok) {
        toast.success('Registered successfully');
        return await res.json();
      }
      throw new Error((await res.json()).message);
    },
    mutationKey: ['auth', 'register'],
  });

  const logout = client.api.auth.token.logout.$post;
  const logoutMutation = useMutation<InferResponseType<typeof logout>, Error, void>({
    mutationFn: async () => {
      const res = await logout();
      if (res.ok) {
        return await res.json();
      }
      throw new Error((await res.json()).message || 'Failed to logout');
    },
    mutationKey: ['auth', 'logout'],
  });

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <form
        className="flex flex-col items-center gap-4"
        onSubmit={e => {
          e.preventDefault();
          loginMutation.mutate(
            {
              email: emailRef.current?.value || '',
              password: passwordRef.current?.value || '',
            },
            {
              onSuccess: () => {
                router.push('/protected');
              },
              onError: error => {
                toast.error(error.message);
              },
            }
          );
        }}
      >
        <h1 className="text-2xl font-bold">Login</h1>
        <input
          type="email"
          ref={emailRef}
          placeholder="Email"
          className="rounded border border-gray-300 p-2"
        />
        <input
          type="password"
          placeholder="Password"
          className="rounded border border-gray-300 p-2"
          ref={passwordRef}
        />
        <input
          type="text"
          placeholder="Name"
          className="rounded border border-gray-300 p-2"
          ref={nameRef}
        />
        {loginMutation.isError && <p>{loginMutation.error.message}</p>}
        {registerMutation.isError && <p>{registerMutation.error.message}</p>}
        {logoutMutation.isError && <p>{logoutMutation.error.message}</p>}
        <button type="submit" className="rounded bg-blue-500 p-2 text-white">
          Login
        </button>
        <button
          type="button"
          className="rounded bg-gray-300 p-2 text-black"
          onClick={() => {
            registerMutation.mutate(
              {
                email: emailRef.current?.value || '',
                password: passwordRef.current?.value || '',
                name: nameRef.current?.value || '',
              },
              {
                onSuccess: () => {
                  toast.success('Registered successfully', {
                    action: {
                      label: 'Clear',
                      onClick: () => {},
                    },
                  });
                  router.push('/protected');
                },
                onError: error => {
                  toast.error(error.message);
                },
              }
            );
          }}
        >
          Register
        </button>
        <button
          type="button"
          className="rounded bg-red-500 p-2 text-white"
          onClick={() => {
            logoutMutation.mutate();
          }}
        >
          Logout
        </button>
      </form>
    </main>
  );
}
