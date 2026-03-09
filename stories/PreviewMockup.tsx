import { ChatRoomScreen } from './preview/ChatRoomScreen';
import { FriendsScreen, ScreenThemeConfig } from './preview/FriendsScreen';
import { MainScreen } from './preview/MainScreen';
import { MoreScreen } from './preview/MoreScreen';
import { OpenChatsScreen } from './preview/OpenChatsScreen';
import { PasscodeScreen } from './preview/PasscodeScreen';
import { ShoppingScreen } from './preview/ShoppingScreen';
import { frameStyle } from './preview/styles';
import { tabScreens, TabBar } from './preview/TabBar';
import { useThemeStore } from './useThemeStore';

export const PreviewMockup = ({ disableTabNavigation = false, mainBgImageUrl }: { disableTabNavigation?: boolean; mainBgImageUrl?: string }) => {
  const currentScreen = useThemeStore((state) => state.currentScreen);
  const globalStore = useThemeStore((state) => state.global);
  const tabBar = useThemeStore((state) => state.tabBar);
  const chatRoom = useThemeStore((state) => state.chatRoom);
  const passcode = useThemeStore((state) => state.passcode);
  const openChatsTab = useThemeStore((state) => state.openChatsTab);

  const chatsTab = useThemeStore((state) => state.chatsTab);
  const friendsTab = useThemeStore((state) => state.friendsTab);

  const screenConfig: ScreenThemeConfig = {
    bodyBg: globalStore.bodyBg,
    headerBg: globalStore.headerBg,
    headerText: globalStore.headerText,
    primaryText: globalStore.primaryText,
    descText: globalStore.descText,
    tabBarBg: tabBar.backgroundColor,
    tabBarIcon: tabBar.inactiveIconColor,
    tabBarSelectedIcon: tabBar.activeIconColor,
    friendsSelectedBg: friendsTab.selectedBg,
    chatBg: chatRoom.backgroundColor,
    otherBubbleBg: chatRoom.friendBubbleBg,
    myBubbleBg: chatRoom.myBubbleBg,
    inputBarBg: chatRoom.inputBarBg,
    sendBtnBg: chatRoom.sendButtonBg,
    passcodeBg: passcode.backgroundColor,
    passcodeKeypadBg: passcode.keypadBg,
    passcodeTitleText: passcode.titleColor,
    passcodeKeypadText: passcode.keypadTextColor,
    unreadCountColor: '#FF3B30',
    openchatBg: openChatsTab.bannerBackgroundColor,
    mainBgImageUrl,
    chatListLastMsgText: chatsTab.lastMsgColor,
    chatListNamePressColor: chatsTab.namePressColor,
    chatListLastMsgPressColor: chatsTab.lastMsgPressColor,
    chatListSelectedBg: chatsTab.selectedBg,
    chatListSelectedBgAlpha: chatsTab.selectedBgAlpha,
    friendsListDescText: friendsTab.listDescTextColor,
    friendsSelectedBgAlpha: friendsTab.selectedBgAlpha,
    moreTabTextColor: globalStore.headerTabText,
    passcodeBgImageUrl: passcode.bgImageUrl || undefined,
    bulletEmptyColor: passcode.bulletEmptyColor,
    bulletFillColor: passcode.bulletFillColor,
  };

  const renderScreen = () => {
    switch (currentScreen) {
      case 'FRIENDS':   return <FriendsScreen config={screenConfig} />;
      case 'CHATS':     return <MainScreen config={screenConfig} />;
      case 'OPENCHATS': return <OpenChatsScreen config={screenConfig} />;
      case 'SHOPPING':  return <ShoppingScreen config={screenConfig} />;
      case 'MORE':      return <MoreScreen config={screenConfig} />;
      case 'CHATROOM':  return <ChatRoomScreen config={screenConfig} />;
      case 'PASSCODE':  return <PasscodeScreen config={screenConfig} />;
      default:          return <MainScreen config={screenConfig} />;
    }
  };

  const showTabBar = tabScreens.includes(currentScreen);

  return (
    <div style={{ position: 'relative', width: 368, height: 699 }}>
      <div
        style={{
          position: 'absolute',
          inset: 0,
          borderRadius: 40,
          border: '5px solid #27272a',
          backgroundColor: '#fff',
          boxShadow: '0 32px 80px rgba(0,0,0,0.45), 0 8px 24px rgba(0,0,0,0.22), 0 0 0 1px rgba(255,255,255,0.2) inset',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: 10,
            left: '50%',
            transform: 'translateX(-50%)',
            width: 91,
            height: 23,
            borderRadius: 999,
            backgroundColor: '#111827',
            zIndex: 20,
          }}
        />

        <section style={{
          ...frameStyle,
          ...(mainBgImageUrl ? {
            backgroundImage: `url(${mainBgImageUrl})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center top',
            backgroundRepeat: 'no-repeat',
            backgroundColor: 'transparent',
          } : {}),
        }}>
          <div style={{ flex: 1, minHeight: 0, display: 'flex' }}>{renderScreen()}</div>
          {showTabBar ? <TabBar disabled={disableTabNavigation} /> : null}
        </section>
      </div>

      <div
        style={{
          position: 'absolute',
          right: -6,
          top: 91,
          width: 4,
          height: 44,
          borderRadius: 4,
          backgroundColor: '#3f3f46',
        }}
      />
      <div
        style={{
          position: 'absolute',
          left: -6,
          top: 84,
          width: 4,
          height: 29,
          borderRadius: 4,
          backgroundColor: '#3f3f46',
        }}
      />
      <div
        style={{
          position: 'absolute',
          left: -6,
          top: 124,
          width: 4,
          height: 29,
          borderRadius: 4,
          backgroundColor: '#3f3f46',
        }}
      />
    </div>
  );
};
