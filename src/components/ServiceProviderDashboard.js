// src/components/ServiceProviderDashboard.js
import React, { useEffect, useState } from "react";
import { Container, Row, Col, Card, Button, Modal, Form, Table, Badge, Alert, Nav } from "react-bootstrap";
import {
  getServiceProviders,
  addServiceProvider,
  updateServiceProvider,
  deleteServiceProvider,
  getServices,
  addService,
  updateService,
  deleteService
} from "../serviceProviderCRUD";
import "./ServiceProviderDashboard.css";
import "./AnalyticsPage.css"; // Import analytics CSS

// Simple Pie Chart Component (from AnalyticsPage)
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

// Simple Bar Chart Component (from AnalyticsPage)
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

// Analytics Section Component
const AnalyticsSection = ({ providers, services }) => {
  const [analyticsData, setAnalyticsData] = useState({
    providerStats: [],
    serviceStats: [],
    statusDistribution: [],
    monthlyGrowth: []
  });

  // Calculate real data from props
  useEffect(() => {
    // Calculate provider categories distribution
    const categoryCount = {};
    providers.forEach(provider => {
      categoryCount[provider.category] = (categoryCount[provider.category] || 0) + 1;
    });
    
    const providerStats = Object.entries(categoryCount).map(([label, value]) => ({
      label,
      value
    }));

    // Calculate service categories distribution
    const serviceCategoryCount = {};
    services.forEach(service => {
      serviceCategoryCount[service.category] = (serviceCategoryCount[service.category] || 0) + 1;
    });
    
    const serviceStats = Object.entries(serviceCategoryCount).map(([label, value]) => ({
      label,
      value
    }));

    // Calculate status distribution
    const statusCount = {};
    providers.forEach(provider => {
      statusCount[provider.status] = (statusCount[provider.status] || 0) + 1;
    });
    
    const statusDistribution = Object.entries(statusCount).map(([label, value]) => ({
      label,
      value
    }));

    // Mock monthly growth (you can replace this with real data)
    const monthlyGrowth = [
      { label: "Jan", value: Math.floor(providers.length * 0.6) },
      { label: "Feb", value: Math.floor(providers.length * 0.7) },
      { label: "Mar", value: Math.floor(providers.length * 0.8) },
      { label: "Apr", value: Math.floor(providers.length * 0.9) },
      { label: "May", value: providers.length },
      { label: "Jun", value: Math.floor(providers.length * 1.1) }
    ];

    setAnalyticsData({
      providerStats,
      serviceStats,
      statusDistribution,
      monthlyGrowth
    });
  }, [providers, services]);

  const chartColors = {
    primary: ['#4F46E5', '#6366F1', '#818CF8', '#A5B4FC', '#C7D2FE'],
    success: ['#10B981', '#34D399', '#6EE7B7', '#A7F3D0'],
    warning: ['#F59E0B', '#FBBF24', '#FCD34D', '#FDE68A'],
    info: ['#3B82F6', '#60A5FA', '#93C5FD', '#BFDBFE']
  };

  const activeProviders = providers.filter(p => p.status === "Active").length;
  const pendingProviders = providers.filter(p => p.status === "Pending").length;
  const availableServices = services.filter(s => s.available).length;

  return (
    <div className="analytics-section">
      {/* Header */}
      <div className="analytics-header mb-4">
        <div>
          <h3>Analytics Dashboard</h3>
          <p className="text-muted">Comprehensive insights and performance metrics</p>
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
              <h3>{providers.length}</h3>
              <p>Total Providers</p>
              <div className="metric-trend up">
                <i className="bi bi-arrow-up"></i> {providers.length > 0 ? Math.round(providers.length * 0.12) : 0}% increase
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
              <h3>{activeProviders}</h3>
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
              <h3>{services.length}</h3>
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
              <h3>{activeProviders > 0 ? Math.round((activeProviders / providers.length) * 100) : 0}%</h3>
              <p>Active Rate</p>
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
    </div>
  );
};

export default function ServiceProviderDashboard() {
  const [providers, setProviders] = useState([]);
  const [showProviderModal, setShowProviderModal] = useState(false);
  const [providerFormData, setProviderFormData] = useState({
    providerId: "",
    businessName: "",
    ownerName: "",
    email: "",
    phone: "",
    address: "",
    category: "Home Services",
    status: "Pending"
  });
  const [editingProviderId, setEditingProviderId] = useState(null);

  const [services, setServices] = useState([]);
  const [showServiceModal, setShowServiceModal] = useState(false);
  const [serviceFormData, setServiceFormData] = useState({
    serviceId: "",
    serviceName: "",
    description: "",
    price: "",
    duration: "",
    category: "Home Services",
    providerId: "",
    available: true
  });
  const [editingServiceId, setEditingServiceId] = useState(null);

  const [message, setMessage] = useState({ type: "", text: "" });
  const [activeView, setActiveView] = useState("overview");

  const fetchProviders = async () => {
    try {
      const data = await getServiceProviders();
      setProviders(data);
    } catch (error) {
      setMessage({ type: "error", text: "Failed to fetch service providers" });
    }
  };

  const fetchServices = async () => {
    try {
      const data = await getServices();
      setServices(data);
    } catch (error) {
      setMessage({ type: "error", text: "Failed to fetch services" });
    }
  };

  useEffect(() => {
    fetchProviders();
    fetchServices();
  }, []);

  // ... (keep all your existing handler functions exactly the same)
  const handleProviderChange = (e) => {
    setProviderFormData({ ...providerFormData, [e.target.name]: e.target.value });
  };

  const handleAddProvider = () => {
    setProviderFormData({
      providerId: "",
      businessName: "",
      ownerName: "",
      email: "",
      phone: "",
      address: "",
      category: "Home Services",
      status: "Pending"
    });
    setEditingProviderId(null);
    setShowProviderModal(true);
  };

  const handleEditProvider = (provider) => {
    setProviderFormData({
      providerId: provider.providerId,
      businessName: provider.businessName,
      ownerName: provider.ownerName,
      email: provider.email,
      phone: provider.phone,
      address: provider.address,
      category: provider.category,
      status: provider.status
    });
    setEditingProviderId(provider.id);
    setShowProviderModal(true);
  };

  const handleSaveProvider = async () => {
    if (!providerFormData.providerId || !providerFormData.businessName || !providerFormData.ownerName || !providerFormData.email || !providerFormData.phone) {
      setMessage({ type: "error", text: "Please fill all required fields" });
      return;
    }

    try {
      if (editingProviderId) {
        await updateServiceProvider(editingProviderId, providerFormData);
        setMessage({ type: "success", text: "Service provider updated successfully!" });
      } else {
        await addServiceProvider(providerFormData);
        setMessage({ type: "success", text: "Service provider registered successfully!" });
      }
      setShowProviderModal(false);
      fetchProviders();
    } catch (error) {
      setMessage({ type: "error", text: "Operation failed" });
    }
  };

  const handleDeleteProvider = async (id) => {
    if (window.confirm("Are you sure you want to delete this service provider?")) {
      try {
        await deleteServiceProvider(id);
        setMessage({ type: "success", text: "Service provider deleted successfully!" });
        fetchProviders();
      } catch (error) {
        setMessage({ type: "error", text: "Failed to delete service provider" });
      }
    }
  };

  const handleServiceChange = (e) => {
    const value = e.target.type === "checkbox" ? e.target.checked : e.target.value;
    setServiceFormData({ ...serviceFormData, [e.target.name]: value });
  };

  const handleAddService = () => {
    setServiceFormData({
      serviceId: "",
      serviceName: "",
      description: "",
      price: "",
      duration: "",
      category: "Home Services",
      providerId: "",
      available: true
    });
    setEditingServiceId(null);
    setShowServiceModal(true);
  };

  const handleEditService = (service) => {
    setServiceFormData({
      serviceId: service.serviceId,
      serviceName: service.serviceName,
      description: service.description,
      price: service.price,
      duration: service.duration,
      category: service.category,
      providerId: service.providerId,
      available: service.available
    });
    setEditingServiceId(service.id);
    setShowServiceModal(true);
  };

  const handleSaveService = async () => {
    if (!serviceFormData.serviceId || !serviceFormData.serviceName || !serviceFormData.price) {
      setMessage({ type: "error", text: "Please fill all required fields" });
      return;
    }

    try {
      if (editingServiceId) {
        await updateService(editingServiceId, serviceFormData);
        setMessage({ type: "success", text: "Service updated successfully!" });
      } else {
        await addService(serviceFormData);
        setMessage({ type: "success", text: "Service added successfully!" });
      }
      setShowServiceModal(false);
      fetchServices();
    } catch (error) {
      setMessage({ type: "error", text: "Operation failed" });
    }
  };

  const handleDeleteService = async (id) => {
    if (window.confirm("Are you sure you want to delete this service?")) {
      try {
        await deleteService(id);
        setMessage({ type: "success", text: "Service deleted successfully!" });
        fetchServices();
      } catch (error) {
        setMessage({ type: "error", text: "Failed to delete service" });
      }
    }
  };

  const categories = ["Home Services", "Beauty & Wellness", "Professional Services", "Education & Training", "Health & Fitness", "Technology", "Other"];

  const activeProviders = providers.filter(p => p.status === "Active").length;
  const pendingProviders = providers.filter(p => p.status === "Pending").length;
  const availableServices = services.filter(s => s.available).length;

  return (
    <div className="dashboard-wrapper">
      {/* Top Header */}
      <div className="dashboard-header">
        <Container fluid>
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h1 className="dashboard-title">Service Provider Dashboard</h1>
              <p className="dashboard-subtitle">Manage your service providers and offerings</p>
            </div>
            <div className="header-actions">
              <Button variant="outline-light" className="me-2">
                <i className="bi bi-bell"></i> Notifications
              </Button>
              <Button variant="outline-light">
                <i className="bi bi-person-circle"></i> Profile
              </Button>
            </div>
          </div>
        </Container>
      </div>

      <Container fluid className="dashboard-content">
        {message.text && (
          <Alert 
            variant={message.type === "error" ? "danger" : "success"} 
            dismissible 
            onClose={() => setMessage({ type: "", text: "" })}
            className="custom-alert"
          >
            <i className={`bi bi-${message.type === "error" ? "exclamation-circle" : "check-circle"}`}></i>
            {message.text}
          </Alert>
        )}

        {/* Navigation Tabs */}
        <Nav variant="pills" className="dashboard-nav mb-4">
          <Nav.Item>
            <Nav.Link 
              active={activeView === "overview"} 
              onClick={() => setActiveView("overview")}
              className="nav-link-custom"
            >
              <i className="bi bi-grid-fill"></i> Overview
            </Nav.Link>
          </Nav.Item>
          <Nav.Item>
            <Nav.Link 
              active={activeView === "providers"} 
              onClick={() => setActiveView("providers")}
              className="nav-link-custom"
            >
              <i className="bi bi-people-fill"></i> Service Providers
            </Nav.Link>
          </Nav.Item>
          <Nav.Item>
            <Nav.Link 
              active={activeView === "services"} 
              onClick={() => setActiveView("services")}
              className="nav-link-custom"
            >
              <i className="bi bi-briefcase-fill"></i> Services
            </Nav.Link>
          </Nav.Item>
          <Nav.Item>
            <Nav.Link 
              active={activeView === "analytics"} 
              onClick={() => setActiveView("analytics")}
              className="nav-link-custom"
            >
              <i className="bi bi-bar-chart-fill"></i> Analytics
            </Nav.Link>
          </Nav.Item>
        </Nav>

        {/* Overview Section */}
        {activeView === "overview" && (
          <>
            <Row className="g-4 mb-4">
              <Col lg={3} md={6}>
                <Card className="stat-card stat-card-blue">
                  <Card.Body>
                    <div className="stat-icon">
                      <i className="bi bi-people"></i>
                    </div>
                    <h3 className="stat-number">{providers.length}</h3>
                    <p className="stat-label">Total Providers</p>
                    <div className="stat-badge">
                      <Badge bg="primary">+{providers.length > 0 ? Math.round(providers.length * 0.12) : 0}% this month</Badge>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
              <Col lg={3} md={6}>
                <Card className="stat-card stat-card-green">
                  <Card.Body>
                    <div className="stat-icon">
                      <i className="bi bi-check-circle"></i>
                    </div>
                    <h3 className="stat-number">{activeProviders}</h3>
                    <p className="stat-label">Active Providers</p>
                    <div className="stat-badge">
                      <Badge bg="success">Verified</Badge>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
              <Col lg={3} md={6}>
                <Card className="stat-card stat-card-orange">
                  <Card.Body>
                    <div className="stat-icon">
                      <i className="bi bi-briefcase"></i>
                    </div>
                    <h3 className="stat-number">{services.length}</h3>
                    <p className="stat-label">Total Services</p>
                    <div className="stat-badge">
                      <Badge bg="warning">{availableServices} Available</Badge>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
              <Col lg={3} md={6}>
                <Card className="stat-card stat-card-purple">
                  <Card.Body>
                    <div className="stat-icon">
                      <i className="bi bi-clock-history"></i>
                    </div>
                    <h3 className="stat-number">{pendingProviders}</h3>
                    <p className="stat-label">Pending Approvals</p>
                    <div className="stat-badge">
                      <Badge bg="info">Review</Badge>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            </Row>

            {/* Quick Actions */}
            <Row className="g-4 mb-4">
              <Col md={6}>
                <Card className="action-card">
                  <Card.Body>
                    <div className="action-icon bg-success">
                      <i className="bi bi-person-plus-fill"></i>
                    </div>
                    <h4>Join as Service Provider</h4>
                    <p className="text-muted">Register your business and start offering services to customers</p>
                    <Button variant="success" size="lg" onClick={handleAddProvider} className="action-button">
                      Register Now <i className="bi bi-arrow-right"></i>
                    </Button>
                  </Card.Body>
                </Card>
              </Col>
              <Col md={6}>
                <Card className="action-card">
                  <Card.Body>
                    <div className="action-icon bg-primary">
                      <i className="bi bi-plus-circle-fill"></i>
                    </div>
                    <h4>Add New Service</h4>
                    <p className="text-muted">Expand your offerings by adding new services to your catalog</p>
                    <Button variant="primary" size="lg" onClick={handleAddService} className="action-button">
                      Add Service <i className="bi bi-arrow-right"></i>
                    </Button>
                  </Card.Body>
                </Card>
              </Col>
            </Row>

            {/* Recent Activities */}
            <Row>
              <Col lg={8}>
                <Card className="recent-card">
                  <Card.Header>
                    <h5><i className="bi bi-clock-history"></i> Recent Service Providers</h5>
                  </Card.Header>
                  <Card.Body>
                    {providers.slice(0, 5).map((provider) => (
                      <div key={provider.id} className="recent-item">
                        <div className="recent-item-icon">
                          <i className="bi bi-building"></i>
                        </div>
                        <div className="recent-item-content">
                          <h6>{provider.businessName}</h6>
                          <p className="text-muted mb-0">{provider.ownerName} • {provider.category}</p>
                        </div>
                        <Badge bg={provider.status === "Active" ? "success" : "warning"}>
                          {provider.status}
                        </Badge>
                      </div>
                    ))}
                  </Card.Body>
                </Card>
              </Col>
              <Col lg={4}>
                <Card className="category-card">
                  <Card.Header>
                    <h5><i className="bi bi-pie-chart"></i> Categories</h5>
                  </Card.Header>
                  <Card.Body>
                    {categories.slice(0, 6).map((cat) => (
                      <div key={cat} className="category-item">
                        <span>{cat}</span>
                        <Badge bg="secondary">{providers.filter(p => p.category === cat).length}</Badge>
                      </div>
                    ))}
                  </Card.Body>
                </Card>
              </Col>
            </Row>
          </>
        )}

        {/* Service Providers Section */}
        {activeView === "providers" && (
          <>
            <div className="section-header">
              <div>
                <h3>Service Providers</h3>
                <p className="text-muted">Manage all registered service providers</p>
              </div>
              <Button variant="success" size="lg" onClick={handleAddProvider}>
                <i className="bi bi-person-plus"></i> Register Provider
              </Button>
            </div>

            <Card className="table-card wider-table">
              <Card.Body className="table-card-body p-0">
                <div className="table-container-wide">
                  <Table responsive hover className="modern-table wider-table">
                    <thead>
                      <tr>
                        <th width="5%">#</th>
                        <th width="12%">Provider ID</th>
                        <th width="20%">Business Name</th>
                        <th width="15%">Owner</th>
                        <th width="18%">Contact</th>
                        <th width="15%">Category</th>
                        <th width="10%">Status</th>
                        <th width="10%">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {providers.length === 0 ? (
                        <tr>
                          <td colSpan="8" className="text-center py-5">
                            <i className="bi bi-inbox" style={{fontSize: "3rem", opacity: 0.3}}></i>
                            <p className="text-muted mt-3">No service providers registered yet</p>
                          </td>
                        </tr>
                      ) : (
                        providers.map((provider, index) => (
                          <tr key={provider.id}>
                            <td>{index + 1}</td>
                            <td><Badge bg="secondary" className="provider-id-badge">{provider.providerId}</Badge></td>
                            <td><strong className="business-name">{provider.businessName}</strong></td>
                            <td>{provider.ownerName}</td>
                            <td>
                              <div className="contact-email">{provider.email}</div>
                              <small className="text-muted contact-phone">{provider.phone}</small>
                            </td>
                            <td><Badge bg="info" className="category-badge">{provider.category}</Badge></td>
                            <td>
                              <Badge bg={provider.status === "Active" ? "success" : provider.status === "Pending" ? "warning" : "danger"} className="status-badge">
                                {provider.status}
                              </Badge>
                            </td>
                            <td>
                              <div className="action-buttons">
                                <Button size="sm" variant="warning" className="me-2 edit-btn" onClick={() => handleEditProvider(provider)}>
                                  <i className="bi bi-pencil"></i>
                                </Button>
                                <Button size="sm" variant="danger" className="delete-btn" onClick={() => handleDeleteProvider(provider.id)}>
                                  <i className="bi bi-trash"></i>
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </Table>
                </div>
              </Card.Body>
            </Card>
          </>
        )}

        {/* Services Section */}
        {activeView === "services" && (
          <>
            <div className="section-header">
              <div>
                <h3>Services Catalog</h3>
                <p className="text-muted">Manage all available services</p>
              </div>
              <Button variant="primary" size="lg" onClick={handleAddService}>
                <i className="bi bi-plus-circle"></i> Add Service
              </Button>
            </div>

            <Row className="g-4">
              {services.length === 0 ? (
                <Col xs={12}>
                  <Card className="text-center py-5">
                    <Card.Body>
                      <i className="bi bi-inbox" style={{fontSize: "3rem", opacity: 0.3}}></i>
                      <p className="text-muted mt-3">No services added yet</p>
                    </Card.Body>
                  </Card>
                </Col>
              ) : (
                services.map((service) => (
                  <Col lg={4} md={6} key={service.id}>
                    <Card className="service-card">
                      <Card.Body>
                        <div className="service-header">
                          <Badge bg={service.available ? "success" : "secondary"}>
                            {service.available ? "Available" : "Unavailable"}
                          </Badge>
                          <Badge bg="info">{service.category}</Badge>
                        </div>
                        <h5 className="mt-3">{service.serviceName}</h5>
                        <p className="text-muted">{service.description}</p>
                        <div className="service-details">
                          <div className="detail-item">
                            <i className="bi bi-tag"></i>
                            <strong>${service.price}</strong>
                          </div>
                          <div className="detail-item">
                            <i className="bi bi-clock"></i>
                            <span>{service.duration}</span>
                          </div>
                          <div className="detail-item">
                            <i className="bi bi-person"></i>
                            <span>{service.providerId}</span>
                          </div>
                        </div>
                        <div className="service-actions">
                          <Button size="sm" variant="warning" onClick={() => handleEditService(service)}>
                            <i className="bi bi-pencil"></i> Edit
                          </Button>
                          <Button size="sm" variant="danger" onClick={() => handleDeleteService(service.id)}>
                            <i className="bi bi-trash"></i> Delete
                          </Button>
                        </div>
                      </Card.Body>
                    </Card>
                  </Col>
                ))
              )}
            </Row>
          </>
        )}

        {/* Analytics Section - Now using the integrated AnalyticsSection component */}
        {activeView === "analytics" && (
          <AnalyticsSection 
            providers={providers}
            services={services}
          />
        )}

        {/* Keep your existing modals exactly as they are */}
        <Modal 
          show={showProviderModal} 
          onHide={() => setShowProviderModal(false)} 
          size="xl" 
          centered 
          className="custom-modal wider-modal"
        >
          {/* ... provider modal content ... */}
        </Modal>

        <Modal show={showServiceModal} onHide={() => setShowServiceModal(false)} size="lg" centered className="custom-modal">
          {/* ... service modal content ... */}
        </Modal>
      </Container>
    </div>
  );
}