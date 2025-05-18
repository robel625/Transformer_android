import React from 'react';
import { StyleSheet, useWindowDimensions } from 'react-native';
import { createDrawerNavigator } from '@react-navigation/drawer';
import Icon from 'react-native-vector-icons/MaterialIcons';
import TransformerScreen from '@/pages/transformer/index.native';
import {
  HomeScene,
  Basestation,
  DrawerContent,
  HelpScene,
  FeedbackScene,
  InviteFriendScene,
} from '.';

type DrawerParamList = {
  home: undefined;
  basestation: undefined;
  help: undefined;
  feedback: undefined;
  invite_friend: undefined;
};

const Drawer = createDrawerNavigator<DrawerParamList>();

const DrawerNavigator: React.FC = () => {
  const window = useWindowDimensions();

  return (
    <Drawer.Navigator
      screenOptions={{
        drawerStyle: {
          width: window.width * 0.75,
          backgroundColor: 'rgba(237, 240, 242, 0.5)',
        },
        sceneContainerStyle: styles.drawerSceneContainer,
        drawerActiveBackgroundColor: '#5cbbff',
        drawerType: 'back',
        overlayColor: 'transparent',
        swipeEdgeWidth: window.width,
        headerShown: false,
        drawerPosition: 'left',
        drawerStatusBarAnimation: 'slide',
      }}
      drawerContent={(props) => <DrawerContent {...props} />}
      detachInactiveScreens={false}
      backBehavior="history"
    >
      {/* <Drawer.Screen 
        name="home" 
        component={HomeScene}
        options={{ title: 'Home' }}
      /> */}
      <Drawer.Screen
        name="Transformers"
        component={TransformerScreen}
        options={{
          title: 'Transformers',
        }}
      />
      <Drawer.Screen 
        name="basestation" 
        component={Basestation}
        options={{ title: 'Basestation' }}
      />
       
      <Drawer.Screen 
        name="help" 
        component={HelpScene}
        options={{ title: 'Help' }}
      />
      <Drawer.Screen 
        name="feedback" 
        component={FeedbackScene}
        options={{ title: 'Feedback' }}
      />
      <Drawer.Screen 
        name="invite_friend" 
        component={InviteFriendScene}
        options={{ title: 'Invite Friend' }}
      />
    </Drawer.Navigator>
  );
};

const styles = StyleSheet.create({
  drawerSceneContainer: {
    elevation: 24,
    shadowColor: 'grey',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.58,
    shadowRadius: 16.0,
  },
});

export default DrawerNavigator;