import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS } from '../../constants/theme';

const ToastSuccess = ({ text1, text2 }: any) => (
  <View style={[styles.container, styles.success]}>
    <Text style={styles.icon}>✅</Text>
    <View style={styles.textContainer}>
      {text1 && <Text style={styles.title}>{text1}</Text>}
      {text2 && <Text style={styles.message}>{text2}</Text>}
    </View>
  </View>
);

const ToastError = ({ text1, text2 }: any) => (
  <View style={[styles.container, styles.error]}>
    <Text style={styles.icon}>❌</Text>
    <View style={styles.textContainer}>
      {text1 && <Text style={styles.title}>{text1}</Text>}
      {text2 && <Text style={styles.message}>{text2}</Text>}
    </View>
  </View>
);

const ToastInfo = ({ text1, text2 }: any) => (
  <View style={[styles.container, styles.info]}>
    <Text style={styles.icon}>ℹ️</Text>
    <View style={styles.textContainer}>
      {text1 && <Text style={styles.title}>{text1}</Text>}
      {text2 && <Text style={styles.message}>{text2}</Text>}
    </View>
  </View>
);

export const toastConfig = {
  success: (props: any) => <ToastSuccess {...props} />,
  error: (props: any) => <ToastError {...props} />,
  info: (props: any) => <ToastInfo {...props} />,
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row', alignItems: 'center',
    marginHorizontal: 16, borderRadius: 14, padding: 14,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15, shadowRadius: 12, elevation: 8,
    minHeight: 56,
  },
  success: { backgroundColor: '#fff', borderLeftWidth: 4, borderLeftColor: COLORS.success },
  error: { backgroundColor: '#fff', borderLeftWidth: 4, borderLeftColor: COLORS.error },
  info: { backgroundColor: '#fff', borderLeftWidth: 4, borderLeftColor: COLORS.primary },
  icon: { fontSize: 20, marginRight: 10 },
  textContainer: { flex: 1 },
  title: { fontSize: 14, fontWeight: '700', color: COLORS.text },
  message: { fontSize: 12, color: COLORS.textSecondary, marginTop: 2 },
});
