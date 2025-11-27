// src/components/AnalyticsPage.js
import React, { useState, useEffect } from "react";
import { Container, Row, Col, Card, Button } from "react-bootstrap";
import "./AnalyticsPage.css";

// Simple Pie Chart Component
const PieChart = ({ data, colors, title }) => {
  const total = data.reduce((sum, item) => sum + item.value, 0);
  let cumulativePercentage = 0;

  return (
    <div className="pie-chart-container">
      <h6 className="chart-title">{title}</h6>
      <div className="pie-chart">
        <svg viewBox="0 0 100 100" className="pie-svg">
          {data.map((item, index) => {
            const percentage = (item.value / total) * 100;
            const startAngle = cumulativePercentage * 3.6;
            cumulativePercentage += percentage;
            const endAngle = cumulativePercentage * 3.6;

            const x1 = 50 + 40 * Math.cos((startAngle - 90) * (Math.PI / 180));
            const y1 = 50 + 40 * Math.sin((startAngle - 90) * (Math.PI / 180));
            const x2 = 50 + 40 * Math.cos((endAngle - 90) * (Math.PI / 180));
            const y2 = 50 + 40 * Math.sin((endAngle - 90) * (Math.PI / 180));

            const largeArcFlag = percentage > 50 ? 1 : 0;

            return (
              <path
                key={index}
                d={`M 50 50 L ${x1} ${y1} A 40 40 0 ${largeArcFlag} 1 ${x2} ${y2} Z`}
                fill={colors[index % colors.length]}
                className="pie-slice"
              />
            );
          })}
          <circle cx="50" cy="50" r="25" fill="white" />
        </svg>
      </div>
      <div className="pie-legend">
        {data.map((item, index) => (
          <div key={index} className="legend-item">
            <div className="legend-color" style={{ backgroundColor: colors[index % colors.length] }}></div>
            <span className="legend-label">{item.label}</span>
            <span className="legend-value">{item.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

// Simple Bar Chart Component
const BarChart = ({ data, colors, title }) => {
  const maxValue = Math.max(...data.map(item => item.value));
  
  return (
    <div className="bar-chart-container">
      <h6 className="chart-title">{title}</h6>
      <div className="bar-chart">
        {data.map((item, index) => (
          <div key={index} className="bar-item">
            <div
              className="bar"
              style={{
                height: `${(item.value / maxValue) * 100}%`,
                backgroundColor: colors[index % colors.length],
              }}
            >
              <span className="bar-value">{item.value}</span>
            </div>
            <span className="bar-label">{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

const AnalyticsPage = () => {
  const [analyticsData, setAnalyticsData] = useState({
    providerStats: [],
    serviceStats: [],
    statusDistribution: [],
    monthlyGrowth: []
  });

  // Mock data - replace with actual API calls
  useEffect(() => {
    const mockData = {
      providerStats: [
        { label: "Home Services", value: 45 },
        { label: "Beauty & Wellness", value: 32 },
        { label: "Professional Services", value: 28 },
        { label: "Education & Training", value: 15 },
        { label: "Health & Fitness", value: 22 },
        { label: "Technology", value: 18 }
      ],
      serviceStats: [
        { label: "Cleaning", value: 120 },
        { label: "Repairs", value: 85 },
        { label: "Consultation", value: 60 },
        { label: "Training", value: 45 },
        { label: "Beauty Services", value: 75 }
      ],
      statusDistribution: [
        { label: "Active", value: 125 },
        { label: "Pending", value: 25 },
        { label: "Inactive", value: 10 }
      ],
      monthlyGrowth: [
        { label: "Jan", value: 80 },
        { label: "Feb", value: 95 },
        { label: "Mar", value: 110 },
        { label: "Apr", value: 125 },
        { label: "May", value: 140 },
        { label: "Jun", value: 160 }
      ]
    };

    setAnalyticsData(mockData);
  }, []);

  const chartColors = {
    primary: ['#4F46E5', '#6366F1', '#818CF8', '#A5B4FC', '#C7D2FE'],
    success: ['#10B981', '#34D399', '#6EE7B7', '#A7F3D0'],
    warning: ['#F59E0B', '#FBBF24', '#FCD34D', '#FDE68A'],
    info: ['#3B82F6', '#60A5FA', '#93C5FD', '#BFDBFE']
  };

  return (
    <div className="analytics-page">
      <Container fluid>
        {/* Header */}
        <div className="analytics-header">
          <div>
            <h1 className="page-title">Analytics Dashboard</h1>
            <p className="page-subtitle">Comprehensive insights and performance metrics</p>
          </div>
          <div className="header-actions">
            <Button variant="outline-primary" className="me-2">
              <i className="bi bi-download"></i> Export Report
            </Button>
            <Button variant="primary">
              <i className="bi bi-arrow-clockwise"></i> Refresh
            </Button>
          </div>
        </div>

        {/* Key Metrics */}
        <Row className="g-4 mb-4">
          <Col lg={3} md={6}>
            <Card className="metric-card">
              <Card.Body>
                <div className="metric-icon bg-primary">
                  <i className="bi bi-people"></i>
                </div>
                <h3>160</h3>
                <p>Total Providers</p>
                <div className="metric-trend up">
                  <i className="bi bi-arrow-up"></i> 12% increase
                </div>
              </Card.Body>
            </Card>
          </Col>
          <Col lg={3} md={6}>
            <Card className="metric-card">
              <Card.Body>
                <div className="metric-icon bg-success">
                  <i className="bi bi-check-circle"></i>
                </div>
                <h3>125</h3>
                <p>Active Providers</p>
                <div className="metric-trend up">
                  <i className="bi bi-arrow-up"></i> 8% increase
                </div>
              </Card.Body>
            </Card>
          </Col>
          <Col lg={3} md={6}>
            <Card className="metric-card">
              <Card.Body>
                <div className="metric-icon bg-warning">
                  <i className="bi bi-briefcase"></i>
                </div>
                <h3>385</h3>
                <p>Total Services</p>
                <div className="metric-trend up">
                  <i className="bi bi-arrow-up"></i> 15% increase
                </div>
              </Card.Body>
            </Card>
          </Col>
          <Col lg={3} md={6}>
            <Card className="metric-card">
              <Card.Body>
                <div className="metric-icon bg-info">
                  <i className="bi bi-graph-up"></i>
                </div>
                <h3>94%</h3>
                <p>Success Rate</p>
                <div className="metric-trend up">
                  <i className="bi bi-arrow-up"></i> 3% increase
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Charts Section */}
        <Row className="g-4">
          {/* Provider Status Distribution */}
          <Col lg={6}>
            <Card className="chart-card">
              <Card.Header>
                <h5><i className="bi bi-pie-chart-fill"></i> Provider Status Distribution</h5>
              </Card.Header>
              <Card.Body>
                <PieChart 
                  data={analyticsData.statusDistribution} 
                  colors={chartColors.primary}
                  title="Provider Status"
                />
              </Card.Body>
            </Card>
          </Col>

          {/* Service Categories */}
          <Col lg={6}>
            <Card className="chart-card">
              <Card.Header>
                <h5><i className="bi bi-pie-chart-fill"></i> Service Categories</h5>
              </Card.Header>
              <Card.Body>
                <PieChart 
                  data={analyticsData.serviceStats.slice(0, 5)} 
                  colors={chartColors.success}
                  title="Top Service Categories"
                />
              </Card.Body>
            </Card>
          </Col>

          {/* Provider Categories */}
          <Col lg={6}>
            <Card className="chart-card">
              <Card.Header>
                <h5><i className="bi bi-bar-chart-fill"></i> Provider Categories</h5>
              </Card.Header>
              <Card.Body>
                <BarChart 
                  data={analyticsData.providerStats.slice(0, 6)} 
                  colors={chartColors.info}
                  title="Provider Categories"
                />
              </Card.Body>
            </Card>
          </Col>

          {/* Monthly Growth */}
          <Col lg={6}>
            <Card className="chart-card">
              <Card.Header>
                <h5><i className="bi bi-bar-chart-fill"></i> Monthly Growth</h5>
              </Card.Header>
              <Card.Body>
                <BarChart 
                  data={analyticsData.monthlyGrowth} 
                  colors={chartColors.warning}
                  title="Monthly Provider Growth"
                />
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default AnalyticsPage;