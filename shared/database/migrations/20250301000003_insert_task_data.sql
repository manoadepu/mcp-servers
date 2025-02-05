-- Tasks for E-Commerce Project Sprint 1 (Infrastructure & Architecture)
INSERT INTO tasks (id, sprint_id, title, description, status, priority, assignee_id, story_points)
VALUES
-- Frontend Team Tasks
('task-001', 'sprint-001', 'Setup Frontend Project', 'Initialize React project with TypeScript and testing framework', 'DONE', 'HIGH', 'user-001', 5),
('task-002', 'sprint-001', 'Design System Setup', 'Create base UI components and theme configuration', 'DONE', 'HIGH', 'user-002', 8),
('task-003', 'sprint-001', 'CI Pipeline for Frontend', 'Setup GitHub Actions for frontend builds and tests', 'DONE', 'MEDIUM', 'user-003', 5),
('task-004', 'sprint-001', 'E2E Testing Framework', 'Configure Cypress for end-to-end testing', 'DONE', 'MEDIUM', 'user-005', 5),

-- Backend Team Tasks
('task-005', 'sprint-001', 'Initialize Backend Services', 'Setup microservices architecture with Node.js', 'DONE', 'HIGH', 'user-006', 8),
('task-006', 'sprint-001', 'Database Schema Design', 'Design initial database schema for core entities', 'DONE', 'HIGH', 'user-007', 5),
('task-007', 'sprint-001', 'Backend CI/CD Setup', 'Configure deployment pipeline for backend services', 'DONE', 'HIGH', 'user-008', 8),
('task-008', 'sprint-001', 'API Gateway Setup', 'Setup and configure API gateway', 'DONE', 'MEDIUM', 'user-009', 5);

-- Tasks for E-Commerce Project Sprint 2 (Auth & Catalog)
INSERT INTO tasks (id, sprint_id, title, description, status, priority, assignee_id, story_points)
VALUES
-- Frontend Team Tasks
('task-009', 'sprint-002', 'Login UI Implementation', 'Create login and registration forms', 'DONE', 'HIGH', 'user-001', 5),
('task-010', 'sprint-002', 'Product Card Design', 'Design and implement product card component', 'DONE', 'HIGH', 'user-002', 5),
('task-011', 'sprint-002', 'Product List View', 'Implement product listing page with filters', 'DONE', 'HIGH', 'user-003', 8),
('task-012', 'sprint-002', 'Auth Flow Tests', 'Write E2E tests for authentication flow', 'DONE', 'MEDIUM', 'user-005', 5),

-- Backend Team Tasks
('task-013', 'sprint-002', 'Auth Service Implementation', 'Implement JWT-based authentication', 'DONE', 'HIGH', 'user-006', 8),
('task-014', 'sprint-002', 'Product Service API', 'Create CRUD APIs for product management', 'DONE', 'HIGH', 'user-007', 8),
('task-015', 'sprint-002', 'Auth Security Review', 'Security audit of authentication system', 'DONE', 'HIGH', 'user-010', 5),
('task-016', 'sprint-002', 'API Documentation', 'Create Swagger documentation for APIs', 'DONE', 'LOW', 'user-009', 3);

-- Tasks for E-Commerce Project Sprint 3 (Shopping Cart)
INSERT INTO tasks (id, sprint_id, title, description, status, priority, assignee_id, story_points)
VALUES
-- Frontend Team Tasks
('task-017', 'sprint-003', 'Shopping Cart UI', 'Implement shopping cart interface', 'DONE', 'HIGH', 'user-001', 8),
('task-018', 'sprint-003', 'Checkout Flow Design', 'Design multi-step checkout process', 'DONE', 'HIGH', 'user-002', 8),
('task-019', 'sprint-003', 'Cart State Management', 'Implement Redux store for cart', 'DONE', 'HIGH', 'user-003', 5),
('task-020', 'sprint-003', 'Payment UI Integration', 'Integrate payment gateway UI', 'DONE', 'HIGH', 'user-004', 8),
('task-021', 'sprint-003', 'Cart Flow Testing', 'E2E tests for cart and checkout', 'DONE', 'MEDIUM', 'user-005', 5),

-- Backend Team Tasks
('task-022', 'sprint-003', 'Cart Service Implementation', 'Create shopping cart microservice', 'DONE', 'HIGH', 'user-006', 8),
('task-023', 'sprint-003', 'Payment Integration', 'Integrate payment gateway API', 'DONE', 'HIGH', 'user-007', 8),
('task-024', 'sprint-003', 'Order Management Service', 'Implement order processing service', 'DONE', 'HIGH', 'user-009', 8),
('task-025', 'sprint-003', 'Payment Security', 'Security review of payment flow', 'DONE', 'CRITICAL', 'user-010', 5);

-- Tasks for E-Commerce Project Sprint 4 (AI & Search)
INSERT INTO tasks (id, sprint_id, title, description, status, priority, assignee_id, story_points)
VALUES
-- Frontend Team Tasks
('task-026', 'sprint-004', 'Search UI Enhancement', 'Implement advanced search interface', 'IN_PROGRESS', 'HIGH', 'user-001', 8),
('task-027', 'sprint-004', 'Product Recommendations UI', 'Add recommendation widgets', 'TODO', 'HIGH', 'user-002', 5),
('task-028', 'sprint-004', 'Search Results Page', 'Implement search results with filtering', 'IN_PROGRESS', 'HIGH', 'user-003', 8),
('task-029', 'sprint-004', 'Performance Optimization', 'Optimize frontend performance', 'TODO', 'MEDIUM', 'user-004', 5),
('task-030', 'sprint-004', 'Search E2E Tests', 'Write tests for search functionality', 'TODO', 'MEDIUM', 'user-005', 5),

-- Backend Team Tasks
('task-031', 'sprint-004', 'Search Service Enhancement', 'Implement Elasticsearch integration', 'IN_PROGRESS', 'HIGH', 'user-006', 8),
('task-032', 'sprint-004', 'Recommendation Engine', 'Build product recommendation system', 'IN_PROGRESS', 'HIGH', 'user-007', 13),
('task-033', 'sprint-004', 'Search Performance', 'Optimize search response time', 'TODO', 'HIGH', 'user-009', 8),
('task-034', 'sprint-004', 'Security Scanning', 'Regular security audit', 'TODO', 'HIGH', 'user-010', 5);

-- Tasks for Healthcare Project Sprint 1 (Data Pipeline)
INSERT INTO tasks (id, sprint_id, title, description, status, priority, assignee_id, story_points)
VALUES
-- Data Science Team Tasks
('task-035', 'sprint-005', 'Data Pipeline Architecture', 'Design data ingestion pipeline', 'DONE', 'HIGH', 'user-011', 8),
('task-036', 'sprint-005', 'ETL Job Implementation', 'Create data transformation jobs', 'DONE', 'HIGH', 'user-012', 8),
('task-037', 'sprint-005', 'Data Validation Framework', 'Implement data quality checks', 'DONE', 'HIGH', 'user-013', 5),
('task-038', 'sprint-005', 'Data Visualization Setup', 'Setup initial dashboards', 'DONE', 'MEDIUM', 'user-014', 5),
('task-039', 'sprint-005', 'Statistical Analysis Tools', 'Configure analysis environment', 'DONE', 'MEDIUM', 'user-015', 5),

-- Platform Team Tasks
('task-040', 'sprint-005', 'Cloud Infrastructure Setup', 'Setup AWS infrastructure', 'DONE', 'HIGH', 'user-016', 8),
('task-041', 'sprint-005', 'Monitoring Configuration', 'Setup monitoring and alerts', 'DONE', 'HIGH', 'user-017', 5),
('task-042', 'sprint-005', 'Data Lake Setup', 'Configure data lake storage', 'DONE', 'HIGH', 'user-018', 8),
('task-043', 'sprint-005', 'Network Security', 'Configure VPC and security groups', 'DONE', 'HIGH', 'user-019', 5);

-- Tasks for Healthcare Project Sprint 2 (Analytics Dashboard)
INSERT INTO tasks (id, sprint_id, title, description, status, priority, assignee_id, story_points)
VALUES
-- Data Science Team Tasks
('task-044', 'sprint-006', 'Dashboard Development', 'Create analytics dashboard', 'DONE', 'HIGH', 'user-011', 8),
('task-045', 'sprint-006', 'Data Pipeline Enhancement', 'Optimize data processing', 'DONE', 'HIGH', 'user-012', 8),
('task-046', 'sprint-006', 'Metric Calculations', 'Implement healthcare metrics', 'DONE', 'HIGH', 'user-013', 8),
('task-047', 'sprint-006', 'Interactive Charts', 'Add interactive visualizations', 'DONE', 'HIGH', 'user-014', 8),
('task-048', 'sprint-006', 'Statistical Reports', 'Generate automated reports', 'DONE', 'MEDIUM', 'user-015', 8),

-- Platform Team Tasks
('task-049', 'sprint-006', 'Performance Optimization', 'Optimize query performance', 'DONE', 'HIGH', 'user-016', 5),
('task-050', 'sprint-006', 'Automated Deployment', 'Setup automated deployments', 'DONE', 'HIGH', 'user-017', 5),
('task-051', 'sprint-006', 'Cache Implementation', 'Add caching layer', 'DONE', 'MEDIUM', 'user-018', 5),
('task-052', 'sprint-006', 'Security Compliance', 'HIPAA compliance checks', 'DONE', 'CRITICAL', 'user-019', 8);

-- Tasks for Healthcare Project Sprint 3 (ML Models)
INSERT INTO tasks (id, sprint_id, title, description, status, priority, assignee_id, story_points)
VALUES
-- Data Science Team Tasks
('task-053', 'sprint-007', 'Predictive Model Development', 'Develop ML models', 'IN_PROGRESS', 'HIGH', 'user-011', 13),
('task-054', 'sprint-007', 'Feature Engineering', 'Create model features', 'IN_PROGRESS', 'HIGH', 'user-012', 8),
('task-055', 'sprint-007', 'Model Training Pipeline', 'Setup automated training', 'TODO', 'HIGH', 'user-013', 8),
('task-056', 'sprint-007', 'Model Visualization', 'Create model insights dashboard', 'TODO', 'MEDIUM', 'user-014', 8),
('task-057', 'sprint-007', 'Statistical Validation', 'Validate model results', 'TODO', 'HIGH', 'user-015', 8),

-- Platform Team Tasks
('task-058', 'sprint-007', 'ML Infrastructure', 'Setup ML training infrastructure', 'IN_PROGRESS', 'HIGH', 'user-016', 8),
('task-059', 'sprint-007', 'Model Deployment Pipeline', 'Create model deployment system', 'IN_PROGRESS', 'HIGH', 'user-017', 8),
('task-060', 'sprint-007', 'Model Monitoring', 'Setup model performance monitoring', 'TODO', 'HIGH', 'user-018', 5),
('task-061', 'sprint-007', 'Data Security Review', 'Security audit of ML pipeline', 'TODO', 'HIGH', 'user-019', 5);

-- Task Labels
INSERT INTO task_labels (id, task_id, name)
VALUES
-- Frontend Features
('label-001', 'task-001', 'infrastructure'),
('label-002', 'task-002', 'feature'),
('label-003', 'task-009', 'feature'),
('label-004', 'task-010', 'feature'),
('label-005', 'task-017', 'feature'),
('label-006', 'task-026', 'feature'),

-- Frontend Automation
('label-007', 'task-003', 'automation'),
('label-008', 'task-004', 'automation'),
('label-009', 'task-012', 'automation'),
('label-010', 'task-021', 'automation'),
('label-011', 'task-030', 'automation'),

-- Backend Features
('label-012', 'task-005', 'infrastructure'),
('label-013', 'task-013', 'feature'),
('label-014', 'task-022', 'feature'),
('label-015', 'task-031', 'feature'),

-- Backend Security
('label-016', 'task-015', 'security'),
('label-017', 'task-025', 'security'),
('label-018', 'task-034', 'security'),

-- Data Science Features
('label-019', 'task-035', 'infrastructure'),
('label-020', 'task-036', 'feature'),
('label-021', 'task-044', 'feature'),
('label-022', 'task-053', 'feature'),

-- Platform Infrastructure
('label-023', 'task-040', 'infrastructure'),
('label-024', 'task-041', 'automation'),
('label-025', 'task-049', 'performance'),
('label-026', 'task-052', 'security');

-- Task Dependencies
INSERT INTO task_dependencies (id, task_id, depends_on_task_id)
VALUES
-- Frontend Dependencies
('dep-001', 'task-009', 'task-013'), -- Login UI depends on Auth Service
('dep-002', 'task-017', 'task-022'), -- Cart UI depends on Cart Service
('dep-003', 'task-026', 'task-031'), -- Search UI depends on Search Service
('dep-004', 'task-027', 'task-032'), -- Recommendations UI depends on Recommendation Engine

-- Backend Dependencies
('dep-005', 'task-013', 'task-005'), -- Auth Service depends on Backend Services
('dep-006', 'task-022', 'task-014'), -- Cart Service depends on Product Service
('dep-007', 'task-032', 'task-031'), -- Recommendation Engine depends on Search Service

-- Data Science Dependencies
('dep-008', 'task-037', 'task-036'), -- Data Validation depends on ETL
('dep-009', 'task-044', 'task-035'), -- Dashboard depends on Data Pipeline
('dep-010', 'task-053', 'task-054'), -- ML Model depends on Feature Engineering

-- Platform Dependencies
('dep-011', 'task-041', 'task-040'), -- Monitoring depends on Infrastructure
('dep-012', 'task-051', 'task-049'), -- Cache depends on Performance Optimization
('dep-013', 'task-059', 'task-058'); -- Model Deployment depends on ML Infrastructure
