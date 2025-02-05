-- Projects
INSERT INTO projects (id, name, description, status, start_date, target_date)
VALUES 
('proj-001', 'E-Commerce Platform', 'Next-gen e-commerce platform with AI recommendations', 'ACTIVE', '2025-01-01', '2025-12-31'),
('proj-002', 'Healthcare Analytics', 'Healthcare data analytics and visualization platform', 'ACTIVE', '2025-02-01', '2025-09-30');

-- Teams for E-Commerce Project
INSERT INTO teams (id, project_id, name, capacity)
VALUES 
('team-001', 'proj-001', 'Frontend Team', 40),
('team-002', 'proj-001', 'Backend Team', 40),
('team-003', 'proj-002', 'Data Science Team', 40),
('team-004', 'proj-002', 'Platform Team', 40);

-- Team Members
INSERT INTO team_members (id, team_id, name, role, skills, availability)
VALUES 
-- Frontend Team
('user-001', 'team-001', 'John Smith', 'Senior Frontend Developer', '{"technical":["React","TypeScript","GraphQL"],"domain":["E-commerce","UX"],"soft":["Leadership","Communication"]}', 100),
('user-002', 'team-001', 'Emma Wilson', 'UI/UX Designer', '{"technical":["Figma","Adobe XD","CSS"],"domain":["User Research","Design Systems"],"soft":["Creativity","Collaboration"]}', 80),
('user-003', 'team-001', 'Michael Brown', 'Frontend Developer', '{"technical":["JavaScript","Vue","CSS"],"domain":["Web Development"],"soft":["Problem Solving"]}', 100),
('user-004', 'team-001', 'Sarah Davis', 'Frontend Developer', '{"technical":["Angular","SASS","Jest"],"domain":["Web Development"],"soft":["Teamwork"]}', 90),
('user-005', 'team-001', 'David Miller', 'QA Engineer', '{"technical":["Selenium","Cypress","TestCafe"],"domain":["Testing"],"soft":["Attention to Detail"]}', 100),

-- Backend Team
('user-006', 'team-002', 'James Wilson', 'Senior Backend Developer', '{"technical":["Node.js","Python","MongoDB"],"domain":["API Design","Microservices"],"soft":["Leadership","Mentoring"]}', 100),
('user-007', 'team-002', 'Lisa Anderson', 'Backend Developer', '{"technical":["Java","Spring","PostgreSQL"],"domain":["Backend Development"],"soft":["Problem Solving"]}', 100),
('user-008', 'team-002', 'Robert Taylor', 'DevOps Engineer', '{"technical":["Docker","Kubernetes","AWS"],"domain":["Infrastructure"],"soft":["Systems Thinking"]}', 90),
('user-009', 'team-002', 'Jennifer White', 'Backend Developer', '{"technical":["Go","gRPC","Redis"],"domain":["Backend Development"],"soft":["Fast Learning"]}', 100),
('user-010', 'team-002', 'Thomas Brown', 'Security Engineer', '{"technical":["Security","OAuth","Encryption"],"domain":["Security"],"soft":["Risk Assessment"]}', 80),

-- Data Science Team
('user-011', 'team-003', 'Maria Garcia', 'Lead Data Scientist', '{"technical":["Python","TensorFlow","SQL"],"domain":["Machine Learning","Healthcare"],"soft":["Leadership","Research"]}', 100),
('user-012', 'team-003', 'Daniel Lee', 'Data Engineer', '{"technical":["Spark","Hadoop","Python"],"domain":["Big Data"],"soft":["Problem Solving"]}', 100),
('user-013', 'team-003', 'Sophie Martin', 'ML Engineer', '{"technical":["PyTorch","scikit-learn","Keras"],"domain":["Deep Learning"],"soft":["Innovation"]}', 90),
('user-014', 'team-003', 'Kevin Chen', 'Data Analyst', '{"technical":["R","Tableau","Power BI"],"domain":["Data Analysis"],"soft":["Data Visualization"]}', 100),
('user-015', 'team-003', 'Rachel Kim', 'Biostatistician', '{"technical":["SAS","R","SPSS"],"domain":["Biostatistics"],"soft":["Statistical Analysis"]}', 80),

-- Platform Team
('user-016', 'team-004', 'Alex Johnson', 'Platform Lead', '{"technical":["AWS","Azure","GCP"],"domain":["Cloud Architecture"],"soft":["Leadership","Strategy"]}', 100),
('user-017', 'team-004', 'Chris Thompson', 'SRE', '{"technical":["Kubernetes","Terraform","Prometheus"],"domain":["Infrastructure"],"soft":["Problem Solving"]}', 100),
('user-018', 'team-004', 'Michelle Wong', 'Platform Engineer', '{"technical":["Docker","Jenkins","Ansible"],"domain":["DevOps"],"soft":["Automation"]}', 90),
('user-019', 'team-004', 'Ryan Peters', 'Network Engineer', '{"technical":["Networking","Security","Load Balancing"],"domain":["Infrastructure"],"soft":["Troubleshooting"]}', 100),
('user-020', 'team-004', 'Amanda Foster', 'Database Administrator', '{"technical":["PostgreSQL","MongoDB","Redis"],"domain":["Databases"],"soft":["Data Management"]}', 80);

-- Sprints for E-Commerce Project
INSERT INTO sprints (id, project_id, name, status, start_date, end_date, goals)
VALUES 
('sprint-001', 'proj-001', 'Sprint 1', 'COMPLETED', '2025-01-01', '2025-01-14', '{"objectives":["Setup project infrastructure","Design system architecture"],"successCriteria":["CI/CD pipeline","Architecture docs"]}'),
('sprint-002', 'proj-001', 'Sprint 2', 'COMPLETED', '2025-01-15', '2025-01-28', '{"objectives":["User authentication","Basic product catalog"],"successCriteria":["Auth flow working","Product listing"]}'),
('sprint-003', 'proj-001', 'Sprint 3', 'COMPLETED', '2025-01-29', '2025-02-11', '{"objectives":["Shopping cart","Checkout flow"],"successCriteria":["Cart functionality","Payment integration"]}'),
('sprint-004', 'proj-001', 'Sprint 4', 'ACTIVE', '2025-02-12', '2025-02-25', '{"objectives":["AI recommendation engine","Search optimization"],"successCriteria":["Recommendation accuracy","Search performance"]}'),

-- Sprints for Healthcare Project
('sprint-005', 'proj-002', 'Sprint 1', 'COMPLETED', '2025-02-01', '2025-02-14', '{"objectives":["Data pipeline setup","Initial ETL processes"],"successCriteria":["Data flow established","Basic transformations"]}'),
('sprint-006', 'proj-002', 'Sprint 2', 'COMPLETED', '2025-02-15', '2025-02-28', '{"objectives":["Basic analytics dashboard","Data validation"],"successCriteria":["Dashboard MVP","Data quality metrics"]}'),
('sprint-007', 'proj-002', 'Sprint 3', 'ACTIVE', '2025-03-01', '2025-03-14', '{"objectives":["Predictive models","Advanced visualizations"],"successCriteria":["Model accuracy","Interactive charts"]}');

-- Sprint Metrics
INSERT INTO sprint_metrics (id, sprint_id, total_points, completed_points, remaining_points, velocity, burndown_data)
VALUES 
-- E-Commerce Project Sprints
('metrics-001', 'sprint-001', 40, 40, 0, 40, '{"dataPoints":[{"date":"2025-01-01","remainingPoints":40,"completedPoints":0},{"date":"2025-01-07","remainingPoints":20,"completedPoints":20},{"date":"2025-01-14","remainingPoints":0,"completedPoints":40}],"idealLine":[{"date":"2025-01-01","expectedPoints":40},{"date":"2025-01-14","expectedPoints":0}]}'),
('metrics-002', 'sprint-002', 45, 45, 0, 45, '{"dataPoints":[{"date":"2025-01-15","remainingPoints":45,"completedPoints":0},{"date":"2025-01-21","remainingPoints":25,"completedPoints":20},{"date":"2025-01-28","remainingPoints":0,"completedPoints":45}],"idealLine":[{"date":"2025-01-15","expectedPoints":45},{"date":"2025-01-28","expectedPoints":0}]}'),
('metrics-003', 'sprint-003', 50, 50, 0, 50, '{"dataPoints":[{"date":"2025-01-29","remainingPoints":50,"completedPoints":0},{"date":"2025-02-04","remainingPoints":30,"completedPoints":20},{"date":"2025-02-11","remainingPoints":0,"completedPoints":50}],"idealLine":[{"date":"2025-01-29","expectedPoints":50},{"date":"2025-02-11","expectedPoints":0}]}'),
('metrics-004', 'sprint-004', 55, 20, 35, 45, '{"dataPoints":[{"date":"2025-02-12","remainingPoints":55,"completedPoints":0},{"date":"2025-02-19","remainingPoints":35,"completedPoints":20}],"idealLine":[{"date":"2025-02-12","expectedPoints":55},{"date":"2025-02-25","expectedPoints":0}]}'),

-- Healthcare Project Sprints
('metrics-005', 'sprint-005', 35, 35, 0, 35, '{"dataPoints":[{"date":"2025-02-01","remainingPoints":35,"completedPoints":0},{"date":"2025-02-07","remainingPoints":15,"completedPoints":20},{"date":"2025-02-14","remainingPoints":0,"completedPoints":35}],"idealLine":[{"date":"2025-02-01","expectedPoints":35},{"date":"2025-02-14","expectedPoints":0}]}'),
('metrics-006', 'sprint-006', 40, 40, 0, 37.5, '{"dataPoints":[{"date":"2025-02-15","remainingPoints":40,"completedPoints":0},{"date":"2025-02-21","remainingPoints":15,"completedPoints":25},{"date":"2025-02-28","remainingPoints":0,"completedPoints":40}],"idealLine":[{"date":"2025-02-15","expectedPoints":40},{"date":"2025-02-28","expectedPoints":0}]}'),
('metrics-007', 'sprint-007', 45, 15, 30, 38.3, '{"dataPoints":[{"date":"2025-03-01","remainingPoints":45,"completedPoints":0},{"date":"2025-03-07","remainingPoints":30,"completedPoints":15}],"idealLine":[{"date":"2025-03-01","expectedPoints":45},{"date":"2025-03-14","expectedPoints":0}]}');
