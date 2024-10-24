import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions, ActivityIndicator } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import firestore from '@react-native-firebase/firestore';
import { Picker } from '@react-native-picker/picker';

const screenWidth = Dimensions.get('window').width;

const RevenueChart = () => {
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1); // Mặc định là tháng hiện tại
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [noData, setNoData] = useState(false); // State để xác định có dữ liệu hay không
  const [months] = useState([
    { label: 'January', value: 1 },
    { label: 'February', value: 2 },
    { label: 'March', value: 3 },
    { label: 'April', value: 4 },
    { label: 'May', value: 5 },
    { label: 'June', value: 6 },
    { label: 'July', value: 7 },
    { label: 'August', value: 8 },
    { label: 'September', value: 9 },
    { label: 'October', value: 10 },
    { label: 'November', value: 11 },
    { label: 'December', value: 12 },
  ]);

  useEffect(() => {
    const fetchRevenueData = async () => {
      setLoading(true);
      setNoData(false); // Reset trạng thái không có dữ liệu khi bắt đầu tải mới

      try {
        const startOfMonth = new Date(new Date().getFullYear(), selectedMonth - 1, 1);
        const endOfMonth = new Date(new Date().getFullYear(), selectedMonth, 0);
        
        const paymentHistorySnapshot = await firestore()
          .collection('payment_history')
          .where('paid_at', '>=', startOfMonth)
          .where('paid_at', '<=', endOfMonth)
          .orderBy('paid_at')
          .get();

        const dailyRevenue = {};

        if (paymentHistorySnapshot.empty) {
          setNoData(true); // Nếu không có dữ liệu, đặt trạng thái noData thành true
        } else {
          paymentHistorySnapshot.docs.forEach(doc => {
            const data = doc.data();
            const date = data.paid_at?.toDate().getDate(); // Kiểm tra nếu paid_at tồn tại
            const totalAmount = data.totalAmount || 0; // Đảm bảo rằng totalAmount không undefined hoặc null

            if (date) {
              if (dailyRevenue[date]) {
                dailyRevenue[date] += totalAmount;
              } else {
                dailyRevenue[date] = totalAmount;
              }
            }
          });

          const chartDataArray = Object.keys(dailyRevenue).map(day => ({
            day,
            revenue: dailyRevenue[day],
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
      <Text style={styles.title}>Revenue for {months[selectedMonth - 1].label}</Text>

      <Picker
        selectedValue={selectedMonth}
        onValueChange={(itemValue) => setSelectedMonth(itemValue)}
        style={styles.picker}
      >
        {months.map(month => (
          <Picker.Item key={month.value} label={month.label} value={month.value} />
        ))}
      </Picker>

      {noData ? (
        // Hiển thị thông báo nếu không có dữ liệu
        <Text style={styles.noDataText}>No revenue data available for this month.</Text>
      ) : (
        <LineChart
          data={generateChartData()}
          width={screenWidth - 32} // Chiều rộng của biểu đồ
          height={220}
          chartConfig={{
            backgroundColor: '#e26a00',
            backgroundGradientFrom: '#fb8c00',
            backgroundGradientTo: '#ffa726',
            decimalPlaces: 2, // Làm tròn số đến 2 chữ số thập phân
            color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
            labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
            style: {
              borderRadius: 16,
            },
            propsForDots: {
              r: '6',
              strokeWidth: '2',
              stroke: '#ffa726',
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
    flex: 1,
    padding: 16,
    justifyContent: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 16,
  },
  picker: {
    height: 50,
    width: 200,
    alignSelf: 'center',
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
