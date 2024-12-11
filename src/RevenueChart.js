import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions, ActivityIndicator } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import firestore from '@react-native-firebase/firestore';
import { Picker } from '@react-native-picker/picker';

const screenWidth = Dimensions.get('window').width;

const RevenueChart = () => {
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [khongCoDuLieu, setKhongCoDuLieu] = useState(false);
  const [months] = useState([
    { label: 'Tháng 1', value: 1 },
    { label: 'Tháng 2', value: 2 },
    { label: 'Tháng 3', value: 3 },
    { label: 'Tháng 4', value: 4 },
    { label: 'Tháng 5', value: 5 },
    { label: 'Tháng 6', value: 6 },
    { label: 'Tháng 7', value: 7 },
    { label: 'Tháng 8', value: 8 },
    { label: 'Tháng 9', value: 9 },
    { label: 'Tháng 10', value: 10 },
    { label: 'Tháng 11', value: 11 },
    { label: 'Tháng 12', value: 12 },
  ]);

  useEffect(() => {
    const fetchRevenueData = async () => {
      setLoading(true);
      setKhongCoDuLieu(false);

      try {
        const startOfMonth = new Date(new Date().getFullYear(), selectedMonth - 1, 1);
        const endOfMonth = new Date(new Date().getFullYear(), selectedMonth, 0);
        
        const paymentHistorySnapshot = await firestore()
          .collection('payment_history')
          .where('paid_at', '>=', startOfMonth)
          .where('paid_at', '<=', endOfMonth)
          .orderBy('paid_at')
          .get();

        const doanhThuHangNgay = {};

        if (paymentHistorySnapshot.empty) {
          setKhongCoDuLieu(true);
        } else {
          paymentHistorySnapshot.docs.forEach(doc => {
            const data = doc.data();
            const date = data.paid_at?.toDate().getDate();
            const totalAmount = data.totalAmount || 0;

            if (date) {
              if (doanhThuHangNgay[date]) {
                doanhThuHangNgay[date] += totalAmount;
              } else {
                doanhThuHangNgay[date] = totalAmount;
              }
            }
          });

          const chartDataArray = Object.keys(doanhThuHangNgay).map(day => ({
            day,
            revenue: doanhThuHangNgay[day],
          }));

          setChartData(chartDataArray);
        }
      } catch (error) {
        console.error('Error fetching revenue data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRevenueData();
  }, [selectedMonth]);

  const generateChartData = () => {
    const labels = chartData.map(item => item.day.toString());
    const dataPoints = chartData.map(item => {
      const value = item.revenue;
      return isNaN(value) || !isFinite(value) ? 0 : value;
    });

    return {
      labels,
      datasets: [
        {
          data: dataPoints,
        },
      ],
    };
  };

  if (loading) {
    return <ActivityIndicator size="large" color="#0000ff" />;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Doanh thu cho {months[selectedMonth - 1].label}</Text>

      <Picker
        selectedValue={selectedMonth}
        onValueChange={(itemValue) => setSelectedMonth(itemValue)}
        style={styles.picker}
      >
        {months.map(month => (
          <Picker.Item key={month.value} label={month.label} value={month.value} />
        ))}
      </Picker>

      {khongCoDuLieu ? (
        <Text style={styles.noDataText}>Không có dữ liệu doanh thu cho tháng này.</Text>
      ) : (
        <LineChart
          data={generateChartData()}
          width={screenWidth - 32}
          height={220}
          chartConfig={{
            backgroundColor: '#0077b6', // Change to a light blue
            backgroundGradientFrom: '#00b4d8', // Gradient start color
            backgroundGradientTo: '#90e0ef',
            decimalPlaces: 0,
            color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
            labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
            style: {
              borderRadius: 16,
            },
            propsForDots: {
              r: '6',
              strokeWidth: '2',
              stroke: '#00b4d8',
            },
          }}
          bezier
          style={{
            marginVertical: 8,
            borderRadius: 16,
          }}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    justifyContent: 'center',
    backgroundColor: '#f0f0f0',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 16,
    color: '#333',
  },
  picker: {
    height: 50,
    width: 200,
    alignSelf: 'center',
    marginBottom: 20,
  },
  noDataText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'red',
    textAlign: 'center',
    marginTop: 20,
  },
});

export default RevenueChart;
