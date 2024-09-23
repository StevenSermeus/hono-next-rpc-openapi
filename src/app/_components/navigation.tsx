'use client';

import React from 'react';

import { useRouter, useSearchParams } from 'next/navigation';

import { InferResponseType } from 'hono';
import { toast } from 'sonner';

import { useMutation, useQueryClient } from '@tanstack/react-query';

import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  navigationMenuTriggerStyle,
} from '@/components/ui/navigation-menu';

import { $api } from '../_api';
import { Button } from './ui/button';

export default function Navigation() {
  const router = useRouter();
  const client = useQueryClient();
  const params = useSearchParams();
  const redirect = params.get('redirect');

  const logout = $api.v1.auth.token.logout.$post;
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
    <NavigationMenu className="mx-auto">
      <NavigationMenuList>
        <NavigationMenuItem>
          <NavigationMenuLink className={navigationMenuTriggerStyle()} href="/">
            Home
          </NavigationMenuLink>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <NavigationMenuLink className={navigationMenuTriggerStyle()} href="/protected">
            Protected
          </NavigationMenuLink>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <NavigationMenuLink
            href={redirect ? `/login?redirect=${redirect}` : '/login'}
            className={navigationMenuTriggerStyle()}
          >
            Login
          </NavigationMenuLink>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <NavigationMenuLink
            href={redirect ? `/register?redirect=${redirect}` : '/register'}
            className={navigationMenuTriggerStyle()}
          >
            Register
          </NavigationMenuLink>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <Button
            variant={'destructive'}
            onClick={() => {
              const t = toast.loading('Logging out...');
              logoutMutation.mutate(undefined, {
                onSuccess: async () => {
                  toast.dismiss(t);
                  toast.success('Logged out');
                  await client.invalidateQueries({
                    queryKey: ['me'],
                  });
                  router.push('/login');
                },
                onError: error => {
                  toast.dismiss(t);
                  toast.error(error.message);
                },
              });
            }}
          >
            Logout
          </Button>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  );
}
