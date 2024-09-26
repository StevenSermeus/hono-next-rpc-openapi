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

const registerSchema = z.object({
  name: z
    .string({ message: 'You must provide a valid name !' })
    .min(2, 'Your name should at lease contain 2 letters'),
  email: z
    .string({
      message: 'You must provide a valid email!',
    })
    .email('You must provide a valid email!'),
  password: z
    .string({
      message: 'You must provide a valid password!',
    })
    .min(8, 'Your password must be at least 8 characters long'),
});

export default function Register() {
  const router = useRouter();
  const params = useSearchParams();
  const register = $api.v1.auth.register.$post;
  const registerMutation = useMutation<
    InferResponseType<typeof register>,
    Error,
    InferRequestType<typeof register>['json']
  >({
    mutationFn: async json => {
      const res = await register({ json });
      if (res.ok) {
        return await res.json();
      }
      throw new Error((await res.json()).message);
    },
    mutationKey: ['auth', 'register'],
  });

  const form = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
    },
  });

  function onSubmit(values: z.infer<typeof registerSchema>) {
    const t = toast.loading('Registering...');
    registerMutation.mutate(values, {
      onSuccess: () => {
        toast.dismiss(t);
        toast.success('Registered successfully');
        const redirect = params.get('redirect');
        router.push(redirect || '/');
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
          name="name"
          render={({ field }) => (
            <FormItem className="w-full">
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input placeholder="John Doe" {...field} />
              </FormControl>
              <FormDescription>This is your full name.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem className="w-full">
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input placeholder="example@example.com" {...field} />
              </FormControl>
              <FormDescription>This is your email address.</FormDescription>
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
                <Input placeholder="********" {...field} type="password" />
              </FormControl>
              <FormDescription>Do not share this.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="mx-auto">
          Register
        </Button>
      </form>
    </Form>
  );
}
