'use client';

import React from 'react';
import { useForm } from 'react-hook-form';

import { useRouter, useSearchParams } from 'next/navigation';

import { InferRequestType, InferResponseType } from 'hono';
import { toast } from 'sonner';
import { z } from 'zod';

import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';

import { $api } from '@/api/react';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';

const loginSchema = z.object({
  email: z
    .string({
      message: 'You must provide a valid email !',
    })
    .email('You must provide a valid email !'),
  password: z
    .string({
      message: 'You must provide a valid password !',
    })
    .min(8, 'Your password must be at lease 8 characters long'),
});

export default function Login() {
  const param = useSearchParams();
  const router = useRouter();
  const login = $api.v1.auth.login.$post;

  const loginMutation = useMutation<
    InferResponseType<typeof login>,
    Error,
    InferRequestType<typeof login>['json']
  >({
    mutationFn: async json => {
      const res = await login({ json });
      if (res.ok) {
        return await res.json();
      }
      throw new Error((await res.json()).message || 'Failed to login');
    },
    mutationKey: ['auth', 'login'],
  });

  const form = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  function onSubmit(values: z.infer<typeof loginSchema>) {
    const t = toast.loading('Logging in...');
    loginMutation.mutate(values, {
      onSuccess: () => {
        toast.dismiss(t);
        toast.success('Logged in successfully');
        const redirect = param.get('redirect') ?? '/';
        router.push(redirect);
      },
      onError: error => {
        toast.dismiss(t);
        toast.error(error.message, {
          action: {
            label: 'Close',
            onClick: () => console.log('close'),
          },
        });
      },
    });
  }
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="flex w-1/2 flex-col items-center">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem className="w-full">
              <FormLabel>Username</FormLabel>
              <FormControl>
                <Input placeholder="shadcn" {...field} />
              </FormControl>
              <FormDescription>This is your public display name.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem className="my-8 w-full">
              <FormLabel>Password</FormLabel>
              <FormControl>
                <Input placeholder="shadcn" {...field} type="password" />
              </FormControl>
              <FormDescription>Do not share this.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="mx-auto">
          Submit
        </Button>
      </form>
    </Form>
  );
}
