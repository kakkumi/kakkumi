import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { useEffect } from 'react';

import { PreviewMockup } from './PreviewMockup';
import { ScreenType, useThemeStore } from './useThemeStore';

type StoryArgs = {
  currentScreen: ScreenType;
};

const PreviewWithStoreSync = ({ currentScreen }: StoryArgs) => {
  const setCurrentScreen = useThemeStore((state) => state.setCurrentScreen);

  useEffect(() => {
    setCurrentScreen(currentScreen);
  }, [currentScreen, setCurrentScreen]);

  return <PreviewMockup />;
};

const meta = {
  title: 'KakaoTheme/PreviewMockup',
  component: PreviewWithStoreSync,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    currentScreen: {
      control: 'select',
      options: ['FRIENDS', 'CHATS', 'OPENCHATS', 'SHOPPING', 'MORE', 'CHATROOM', 'PASSCODE'],
    },
  },
  args: {
    currentScreen: 'CHATS',
  },
} satisfies Meta<typeof PreviewWithStoreSync>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Friends: Story = {
  args: { currentScreen: 'FRIENDS' },
};

export const Chats: Story = {
  args: { currentScreen: 'CHATS' },
};

export const OpenChats: Story = {
  args: { currentScreen: 'OPENCHATS' },
};

export const ChatRoom: Story = {
  args: { currentScreen: 'CHATROOM' },
};

export const Passcode: Story = {
  args: { currentScreen: 'PASSCODE' },
};
