// Client-side Mock Backend Database and API Router
// Persists state to localStorage to allow full feature flow without a running backend database.

const STORAGE_KEYS = {
  USERS: 'th_mock_users',
  JOBS: 'th_mock_jobs',
  APPLICATIONS: 'th_mock_applications',
  SAVED_JOBS: 'th_mock_saved_jobs',
  NOTIFICATIONS: 'th_mock_notifications',
  RESUMES: 'th_mock_resumes',
};

// Cache and Fetch for Arbeitnow Jobs in Browser Mock Mode
let memoizedArbeitnowJobs = null;

const fetchArbeitnowJobs = async () => {
  if (memoizedArbeitnowJobs) return memoizedArbeitnowJobs;
  try {
    const res = await fetch('https://www.arbeitnow.com/api/job-board-api');
    if (res.ok) {
      const json = await res.json();
      const raw = json.data || [];
      memoizedArbeitnowJobs = raw.map(j => ({
        _id: j.slug,
        title: j.title,
        companyName: j.company_name,
        companyLogo: '/default-company-logo.png',
        companyWebsite: null,
        companyLocation: j.location || 'Remote',
        location: j.location || 'Remote',
        jobType: j.remote ? 'Remote' : 'Onsite',
        employmentType: 'Full Time',
        salary: null,
        experience: 'N/A',
        skillsRequired: Array.isArray(j.tags) ? j.tags : [],
        category: 'Technology',
        deadline: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'open',
        description: j.description,
        source: 'Arbeitnow',
        applyUrl: j.url,
        createdAt: j.created_at ? new Date(j.created_at * 1000).toISOString() : new Date().toISOString(),
      }));
      return memoizedArbeitnowJobs;
    }
  } catch (err) {
    console.error('Failed to load external jobs in mock backend:', err);
  }
  return [];
};


// Seed initial data if not present
export const seedMockDatabase = () => {
  // 1. Seed Users
  if (!localStorage.getItem(STORAGE_KEYS.USERS)) {
    const defaultUsers = [
      {
        _id: 'u-cand-1',
        name: 'Jane Doe',
        email: 'candidate@tetrahire.com',
        password: 'password', // in mock mode we do direct compare
        role: 'candidate',
        title: 'Senior Frontend Engineer',
        bio: 'Passionate JavaScript & React developer with 5+ years of building responsive SaaS products.',
        skills: ['React', 'JavaScript', 'TailwindCSS', 'Node.js', 'TypeScript'],
        profileImage: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
        resumeUrl: 'mock-resume.pdf',
        location: 'San Francisco, CA',
        experience: '5 Years',
        education: 'B.S. in Computer Science',
      },
      {
        _id: 'u-emp-1',
        name: 'Sarah Connor',
        email: 'employer@tetrahire.com',
        password: 'password',
        role: 'employer',
        companyName: 'Cyberdyne Systems',
        logo: 'https://images.unsplash.com/photo-1549719386-74dfcbf7dbed?w=150',
        website: 'https://cyberdyne.com',
        bio: 'Building the future of artificial intelligence and robotics.',
        location: 'Los Angeles, CA',
        verified: true,
      },
      {
        _id: 'u-emp-2',
        name: 'Tony Stark',
        email: 'stark@stark.com',
        password: 'password',
        role: 'employer',
        companyName: 'Stark Industries',
        logo: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150',
        website: 'https://starkindustries.com',
        bio: 'Innovative technology company powering global progress.',
        location: 'New York, NY',
        verified: false,
      },
      {
        _id: 'u-adm-1',
        name: 'Alex Mercer',
        email: 'admin@tetrahire.com',
        password: 'password',
        role: 'admin',
        profileImage: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
      }
    ];
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(defaultUsers));
  }

  // 2. Seed Jobs
  if (!localStorage.getItem(STORAGE_KEYS.JOBS)) {
    const defaultJobs = [
      {
        _id: 'job-1',
        title: 'Senior React Developer',
        employerId: 'u-emp-1',
        companyName: 'Cyberdyne Systems',
        companyLogo: 'https://images.unsplash.com/photo-1549719386-74dfcbf7dbed?w=150',
        location: 'San Francisco, CA (Remote)',
        type: 'Full-time',
        category: 'Technology',
        salary: '$120,000 - $150,000',
        experienceLevel: 'Senior',
        description: 'We are seeking an expert Frontend Engineer with solid React capabilities. You will build user-facing platforms to control complex automated systems. Required: 5+ years of React, CSS grid/flexbox, state management.',
        requirements: ['5+ years React experience', 'Solid understanding of Redux/Zustand', 'Strong TailwindCSS skills', 'Experience with charts/visualizations'],
        status: 'open',
        applicantsCount: 3,
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        _id: 'job-2',
        title: 'DevOps & Cloud Engineer',
        employerId: 'u-emp-1',
        companyName: 'Cyberdyne Systems',
        companyLogo: 'https://images.unsplash.com/photo-1549719386-74dfcbf7dbed?w=150',
        location: 'Los Angeles, CA',
        type: 'Full-time',
        category: 'Technology',
        salary: '$130,000 - $160,000',
        experienceLevel: 'Mid-Senior',
        description: 'Deploy, monitor, and scale robotic networks. Seeking expertise in AWS, Kubernetes, Docker, and CI/CD pipelines.',
        requirements: ['Kubernetes cluster management', 'AWS/GCP expertise', 'Docker containers', 'Terraform infrastructure as code'],
        status: 'open',
        applicantsCount: 2,
        createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        _id: 'job-3',
        title: 'UX/UI Product Designer',
        employerId: 'u-emp-2',
        companyName: 'Stark Industries',
        companyLogo: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150',
        location: 'New York, NY (Hybrid)',
        type: 'Contract',
        category: 'Design',
        salary: '$90 - $120 / hour',
        experienceLevel: 'Senior',
        description: 'Design HUD displays and high-performance interactive interfaces for core engineering divisions. Must have advanced Figma design system experience.',
        requirements: ['Figma design systems mastery', 'UI prototyping', 'Interactive mockups', 'User testing methodology'],
        status: 'open',
        applicantsCount: 1,
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        _id: 'job-4',
        title: 'Financial Planning Analyst',
        employerId: 'u-emp-2',
        companyName: 'Stark Industries',
        companyLogo: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150',
        location: 'New York, NY',
        type: 'Full-time',
        category: 'Finance',
        salary: '$100,000 - $125,000',
        experienceLevel: 'Mid',
        description: 'Analyze budget forecasts, corporate expenditures, and capital allocations across various science divisions.',
        requirements: ['B.S. in Finance/Economics', '3+ years financial analysis', 'Advanced Excel capabilities', 'ERP software experience'],
        status: 'open',
        applicantsCount: 0,
        createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
      }
    ];
    localStorage.setItem(STORAGE_KEYS.JOBS, JSON.stringify(defaultJobs));
  }

  // 3. Seed Applications
  if (!localStorage.getItem(STORAGE_KEYS.APPLICATIONS)) {
    const defaultApplications = [
      {
        _id: 'app-1',
        jobId: 'job-1',
        candidateId: {
          _id: 'u-cand-1',
          name: 'Jane Doe',
          email: 'candidate@tetrahire.com',
          profileImage: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
          title: 'Senior Frontend Engineer',
          skills: ['React', 'JavaScript', 'TailwindCSS'],
        },
        employerId: 'u-emp-1',
        resumeName: 'Jane_Doe_Resume_2026.pdf',
        coverLetter: 'I would love to build interface components for Cyberdyne systems.',
        status: 'pending',
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        _id: 'app-2',
        jobId: 'job-2',
        candidateId: {
          _id: 'u-cand-1',
          name: 'Jane Doe',
          email: 'candidate@tetrahire.com',
          profileImage: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
          title: 'Senior Frontend Engineer',
          skills: ['React', 'JavaScript', 'TailwindCSS'],
        },
        employerId: 'u-emp-1',
        resumeName: 'Jane_Doe_Resume_2026.pdf',
        coverLetter: 'Interested in configuring systems networks.',
        status: 'reviewed',
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      }
    ];
    localStorage.setItem(STORAGE_KEYS.APPLICATIONS, JSON.stringify(defaultApplications));
  }

  // 4. Seed Saved Jobs
  if (!localStorage.getItem(STORAGE_KEYS.SAVED_JOBS)) {
    localStorage.setItem(STORAGE_KEYS.SAVED_JOBS, JSON.stringify(['job-3']));
  }

  // 5. Seed Resumes
  if (!localStorage.getItem(STORAGE_KEYS.RESUMES)) {
    const defaultResumes = [
      {
        _id: 'res-1',
        name: 'Jane_Doe_Resume_2026.pdf',
        createdAt: new Date().toISOString(),
      }
    ];
    localStorage.setItem(STORAGE_KEYS.RESUMES, JSON.stringify(defaultResumes));
  }

  // 6. Seed Notifications
  if (!localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS)) {
    const defaultNotifications = [
      {
        _id: 'notif-1',
        userId: 'u-cand-1',
        title: 'Application Reviewed',
        message: 'Your application for DevOps & Cloud Engineer has been marked as reviewed by Cyberdyne Systems.',
        isRead: false,
        createdAt: new Date().toISOString(),
      },
      {
        _id: 'notif-2',
        userId: 'u-cand-1',
        title: 'Welcome to TetraHire!',
        message: 'Get started by completing your profile and uploading your resume.',
        isRead: true,
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      }
    ];
    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(defaultNotifications));
  }
};

// Simulated DB getters and setters
const getDB = (key) => JSON.parse(localStorage.getItem(key) || '[]');
const setDB = (key, data) => localStorage.setItem(key, JSON.stringify(data));

// Main Mock Request router
export const handleMockRequest = async (method, url, data, headers) => {
  // Ensure the DB is seeded
  seedMockDatabase();

  const cleanUrl = url.replace(/^[a-zA-Z]+:\/\/[^\/]+/, '').replace('/api', '');
  const currentUser = JSON.parse(localStorage.getItem('user') || 'null');

  // Helper response builders
  const success = (payload) => ({ data: { success: true, data: payload } });
  const successMsg = (msg, payload) => ({ data: { success: true, message: msg, data: payload } });
  const failure = (msg, status = 400) => {
    const err = new Error(msg);
    err.response = { status, data: { success: false, message: msg } };
    throw err;
  };

  // --- ROUTING PATHS ---

  // Auth / Login
  if (method === 'post' && cleanUrl === '/auth/login') {
    const { email, password } = data;
    const users = getDB(STORAGE_KEYS.USERS);
    const matchedUser = users.find(u => u.email.toLowerCase() === email.toLowerCase());

    if (!matchedUser || matchedUser.password !== password) {
      return failure('Invalid email or password.');
    }

    const { password: _, ...userWithoutPass } = matchedUser;
    return success({
      user: userWithoutPass,
      accessToken: 'mock-access-token-' + Date.now(),
      refreshToken: 'mock-refresh-token-' + Date.now(),
    });
  }

  // Auth / Register
  if (method === 'post' && cleanUrl === '/auth/register') {
    const { name, email, password, role, companyName } = data;
    const users = getDB(STORAGE_KEYS.USERS);

    if (users.some(u => u.email.toLowerCase() === email.toLowerCase())) {
      return failure('Email already exists.');
    }

    const newUser = {
      _id: 'u-' + Date.now(),
      name,
      email,
      password,
      role,
      verified: role === 'employer' ? false : undefined,
      companyName: role === 'employer' ? companyName : undefined,
      createdAt: new Date().toISOString(),
    };

    users.push(newUser);
    setDB(STORAGE_KEYS.USERS, users);

    const { password: _, ...userWithoutPass } = newUser;
    return success({
      user: userWithoutPass,
      accessToken: 'mock-access-token-' + Date.now(),
      refreshToken: 'mock-refresh-token-' + Date.now(),
    });
  }

  // Auth / Profile
  if (method === 'get' && cleanUrl === '/auth/profile') {
    if (!currentUser) return failure('Unauthorized', 401);
    const users = getDB(STORAGE_KEYS.USERS);
    const matchedUser = users.find(u => u._id === currentUser._id);

    if (!matchedUser) return failure('User not found', 404);
    const { password: _, ...userWithoutPass } = matchedUser;

    return success({
      user: userWithoutPass,
      profile: userWithoutPass, // client expects profile matching
    });
  }

  if (method === 'put' && cleanUrl === '/auth/profile') {
    if (!currentUser) return failure('Unauthorized', 401);
    const users = getDB(STORAGE_KEYS.USERS);
    const userIndex = users.findIndex(u => u._id === currentUser._id);

    if (userIndex === -1) return failure('User not found', 404);

    users[userIndex] = {
      ...users[userIndex],
      ...data,
    };
    setDB(STORAGE_KEYS.USERS, users);

    const { password: _, ...updatedUser } = users[userIndex];
    localStorage.setItem('user', JSON.stringify(updatedUser));
    return successMsg('Profile updated successfully', updatedUser);
  }

  if (method === 'put' && cleanUrl === '/auth/change-password') {
    if (!currentUser) return failure('Unauthorized', 401);
    const { currentPassword, newPassword } = data;
    const users = getDB(STORAGE_KEYS.USERS);
    const userIndex = users.findIndex(u => u._id === currentUser._id);

    if (userIndex === -1) return failure('User not found', 404);
    if (users[userIndex].password !== currentPassword) {
      return failure('Incorrect current password.');
    }

    users[userIndex].password = newPassword;
    setDB(STORAGE_KEYS.USERS, users);
    return success({ success: true, message: 'Password changed successfully' });
  }

  // Candidate Jobs Search
  if (method === 'get' && cleanUrl.startsWith('/candidate/jobs')) {
    const localJobs = getDB(STORAGE_KEYS.JOBS).filter(j => j.status === 'open');
    const apiJobs = await fetchArbeitnowJobs();
    const jobs = [...localJobs, ...apiJobs];
    
    // Parse query params if any
    const urlObj = new URL('http://localhost' + cleanUrl);
    const search = urlObj.searchParams.get('search') || '';
    const category = urlObj.searchParams.get('category') || '';
    const type = urlObj.searchParams.get('type') || '';
    const location = urlObj.searchParams.get('location') || '';

    let filteredJobs = jobs;
    if (search) {
      const q = search.toLowerCase();
      filteredJobs = filteredJobs.filter(j => 
        j.title.toLowerCase().includes(q) || 
        j.companyName.toLowerCase().includes(q) ||
        j.description.toLowerCase().includes(q)
      );
    }
    if (category) {
      filteredJobs = filteredJobs.filter(j => j.category.toLowerCase() === category.toLowerCase());
    }
    if (type) {
      filteredJobs = filteredJobs.filter(j => j.type.toLowerCase() === type.toLowerCase());
    }
    if (location) {
      filteredJobs = filteredJobs.filter(j => j.location.toLowerCase().includes(location.toLowerCase()));
    }

    // Check if ID requested
    const idMatch = cleanUrl.match(/\/candidate\/jobs\/([a-zA-Z0-9\-]+)/);
    if (idMatch) {
      const singleJob = jobs.find(j => j._id === idMatch[1]);
      if (!singleJob) return failure('Job not found', 404);
      return success(singleJob);
    }

    return {
      data: {
        success: true,
        data: filteredJobs,
        total: filteredJobs.length,
      }
    };
  }

  // Saved Jobs
  if (cleanUrl === '/candidate/saved-jobs') {
    const savedIds = getDB(STORAGE_KEYS.SAVED_JOBS);
    const localJobs = getDB(STORAGE_KEYS.JOBS);
    const apiJobs = await fetchArbeitnowJobs();
    const jobs = [...localJobs, ...apiJobs];
    const savedList = jobs.filter(j => savedIds.includes(j._id));


    if (method === 'get') {
      return success(savedList);
    }
    if (method === 'post') {
      const { jobId } = data;
      if (!savedIds.includes(jobId)) {
        savedIds.push(jobId);
        setDB(STORAGE_KEYS.SAVED_JOBS, savedIds);
      }
      return successMsg('Job saved successfully');
    }
  }

  const savedIdMatch = cleanUrl.match(/\/candidate\/saved-jobs\/([a-zA-Z0-9\-]+)/);
  if (method === 'delete' && savedIdMatch) {
    const jobId = savedIdMatch[1];
    let savedIds = getDB(STORAGE_KEYS.SAVED_JOBS);
    savedIds = savedIds.filter(id => id !== jobId);
    setDB(STORAGE_KEYS.SAVED_JOBS, savedIds);
    return successMsg('Job removed from saved');
  }

  // Applications
  if (cleanUrl === '/candidate/applications') {
    const apps = getDB(STORAGE_KEYS.APPLICATIONS);
    const localJobs = getDB(STORAGE_KEYS.JOBS);
    const apiJobs = await fetchArbeitnowJobs();
    const jobs = [...localJobs, ...apiJobs];
    
    // Join job details onto apps
    const candidateApps = apps
      .filter(a => a.candidateId._id === currentUser?._id || a.candidateId === currentUser?._id)
      .map(app => ({
        ...app,
        jobId: jobs.find(j => j._id === (app.jobId._id || app.jobId)) || app.jobId
      }));

    return success(candidateApps);
  }

  if (method === 'post' && cleanUrl === '/candidate/apply') {
    const { jobId, coverLetter, resumeName } = data;
    const apps = getDB(STORAGE_KEYS.APPLICATIONS);

    const newApp = {
      _id: 'app-' + Date.now(),
      jobId,
      candidateId: {
        _id: currentUser._id,
        name: currentUser.name,
        email: currentUser.email,
        profileImage: currentUser.profileImage,
        title: currentUser.title || '',
        skills: currentUser.skills || [],
      },
      employerId: getDB(STORAGE_KEYS.JOBS).find(j => j._id === jobId)?.employerId || 'u-emp-1',
      resumeName: resumeName || 'Jane_Doe_Resume_2026.pdf',
      coverLetter,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };

    apps.push(newApp);
    setDB(STORAGE_KEYS.APPLICATIONS, apps);

    // Increment applicant count on job
    const jobs = getDB(STORAGE_KEYS.JOBS);
    const jobIndex = jobs.findIndex(j => j._id === jobId);
    if (jobIndex !== -1) {
      jobs[jobIndex].applicantsCount = (jobs[jobIndex].applicantsCount || 0) + 1;
      setDB(STORAGE_KEYS.JOBS, jobs);
    }

    return successMsg('Application submitted successfully!');
  }

  const appIdMatch = cleanUrl.match(/\/candidate\/applications\/([a-zA-Z0-9\-]+)/);
  if (method === 'delete' && appIdMatch) {
    const appId = appIdMatch[1];
    let apps = getDB(STORAGE_KEYS.APPLICATIONS);
    apps = apps.filter(a => a._id !== appId);
    setDB(STORAGE_KEYS.APPLICATIONS, apps);
    return successMsg('Application withdrawn successfully');
  }

  // Resumes
  if (cleanUrl === '/candidate/resumes') {
    return success(getDB(STORAGE_KEYS.RESUMES));
  }

  if (method === 'post' && cleanUrl === '/candidate/upload-resume') {
    const resumes = getDB(STORAGE_KEYS.RESUMES);
    const newResume = {
      _id: 'res-' + Date.now(),
      name: data.get ? data.get('resume')?.name || 'resume.pdf' : 'Uploaded_Resume.pdf',
      createdAt: new Date().toISOString(),
    };
    resumes.push(newResume);
    setDB(STORAGE_KEYS.RESUMES, resumes);
    return successMsg('Resume uploaded successfully', newResume);
  }

  // Notifications
  if (cleanUrl === '/notifications') {
    const notifs = getDB(STORAGE_KEYS.NOTIFICATIONS).filter(n => n.userId === currentUser?._id);
    return success(notifs);
  }

  if (method === 'put' && cleanUrl === '/notifications/read-all') {
    const notifs = getDB(STORAGE_KEYS.NOTIFICATIONS);
    notifs.forEach(n => {
      if (n.userId === currentUser?._id) n.isRead = true;
    });
    setDB(STORAGE_KEYS.NOTIFICATIONS, notifs);
    return successMsg('All notifications marked as read');
  }

  const notifReadMatch = cleanUrl.match(/\/notifications\/([a-zA-Z0-9\-]+)\/read/);
  if (method === 'put' && notifReadMatch) {
    const notifId = notifReadMatch[1];
    const notifs = getDB(STORAGE_KEYS.NOTIFICATIONS);
    const target = notifs.find(n => n._id === notifId);
    if (target) target.isRead = true;
    setDB(STORAGE_KEYS.NOTIFICATIONS, notifs);
    return successMsg('Notification marked as read');
  }

  // Company Details
  const companyMatch = cleanUrl.match(/\/candidate\/company\/([a-zA-Z0-9\-]+)/);
  if (method === 'get' && companyMatch) {
    const empId = companyMatch[1];
    const users = getDB(STORAGE_KEYS.USERS);
    const companyUser = users.find(u => u._id === empId && u.role === 'employer');
    if (!companyUser) return failure('Company not found', 404);
    return success(companyUser);
  }

  // Employer Profile upload logo
  if (method === 'post' && cleanUrl === '/employer/upload-logo') {
    return successMsg('Logo uploaded successfully', { logoUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150' });
  }

  // Employer Dashboard
  if (cleanUrl === '/employer/dashboard') {
    const jobs = getDB(STORAGE_KEYS.JOBS).filter(j => j.employerId === currentUser?._id);
    const apps = getDB(STORAGE_KEYS.APPLICATIONS).filter(a => a.employerId === currentUser?._id);
    
    return success({
      totalJobs: jobs.length,
      activeJobs: jobs.filter(j => j.status === 'open').length,
      totalApplications: apps.length,
      pendingApplications: apps.filter(a => a.status === 'pending').length,
      applicationTrends: [
        { date: 'Mon', count: 2 },
        { date: 'Tue', count: 4 },
        { date: 'Wed', count: 1 },
        { date: 'Thu', count: 5 },
        { date: 'Fri', count: 3 },
      ]
    });
  }

  // Employer Jobs management
  if (cleanUrl === '/employer/jobs') {
    const jobs = getDB(STORAGE_KEYS.JOBS).filter(j => j.employerId === currentUser?._id);
    if (method === 'get') {
      return success(jobs);
    }
    if (method === 'post') {
      const jobsAll = getDB(STORAGE_KEYS.JOBS);
      const newJob = {
        _id: 'job-' + Date.now(),
        ...data,
        employerId: currentUser._id,
        companyName: currentUser.companyName || 'My Company',
        companyLogo: currentUser.logo || '/default-company-logo.png',
        status: 'open',
        applicantsCount: 0,
        createdAt: new Date().toISOString(),
      };
      jobsAll.push(newJob);
      setDB(STORAGE_KEYS.JOBS, jobsAll);
      return successMsg('Job posted successfully', newJob);
    }
  }

  const empJobDeleteMatch = cleanUrl.match(/\/employer\/jobs\/([a-zA-Z0-9\-]+)/);
  if (empJobDeleteMatch) {
    const jobId = empJobDeleteMatch[1];
    if (method === 'delete') {
      let jobs = getDB(STORAGE_KEYS.JOBS);
      jobs = jobs.filter(j => j._id !== jobId);
      setDB(STORAGE_KEYS.JOBS, jobs);
      return successMsg('Job deleted successfully');
    }
    if (method === 'put' && cleanUrl.endsWith('/close')) {
      const jobs = getDB(STORAGE_KEYS.JOBS);
      const job = jobs.find(j => j._id === jobId);
      if (job) job.status = 'closed';
      setDB(STORAGE_KEYS.JOBS, jobs);
      return successMsg('Job closed successfully');
    }
  }

  // Employer Applicants listing
  const empJobApplicantsMatch = cleanUrl.match(/\/employer\/jobs\/([a-zA-Z0-9\-]+)\/applicants/);
  if (method === 'get' && empJobApplicantsMatch) {
    const jobId = empJobApplicantsMatch[1];
    const apps = getDB(STORAGE_KEYS.APPLICATIONS).filter(a => a.jobId === jobId || a.jobId._id === jobId);
    return success(apps);
  }

  const empAppStatusMatch = cleanUrl.match(/\/employer\/applications\/([a-zA-Z0-9\-]+)\/status/);
  if (method === 'put' && empAppStatusMatch) {
    const appId = empAppStatusMatch[1];
    const { status } = data;
    const apps = getDB(STORAGE_KEYS.APPLICATIONS);
    const targetApp = apps.find(a => a._id === appId);

    if (targetApp) {
      targetApp.status = status;
      setDB(STORAGE_KEYS.APPLICATIONS, apps);

      // Create notification for candidate
      const notifs = getDB(STORAGE_KEYS.NOTIFICATIONS);
      notifs.push({
        _id: 'notif-' + Date.now(),
        userId: targetApp.candidateId._id || targetApp.candidateId,
        title: `Application ${status.charAt(0).toUpperCase() + status.slice(1)}`,
        message: `Your application has been marked as ${status}.`,
        isRead: false,
        createdAt: new Date().toISOString(),
      });
      setDB(STORAGE_KEYS.NOTIFICATIONS, notifs);
    }
    return successMsg(`Application status updated to ${status}`);
  }

  // Admin Dashboard
  if (cleanUrl === '/admin/dashboard') {
    const users = getDB(STORAGE_KEYS.USERS);
    const jobs = getDB(STORAGE_KEYS.JOBS);
    const apps = getDB(STORAGE_KEYS.APPLICATIONS);

    return success({
      totalUsers: users.length,
      totalJobs: jobs.length,
      totalApplications: apps.length,
      verifiedEmployers: users.filter(u => u.role === 'employer' && u.verified).length,
      pendingVerifications: users.filter(u => u.role === 'employer' && !u.verified).length,
      recentLogs: [
        { message: 'Candidate registered: Jane Doe', timestamp: new Date().toISOString() },
        { message: 'Employer verified: Cyberdyne Systems', timestamp: new Date().toISOString() }
      ]
    });
  }

  if (method === 'get' && cleanUrl === '/admin/users') {
    const users = getDB(STORAGE_KEYS.USERS).map(({ password: _, ...rest }) => rest);
    return success(users);
  }

  if (cleanUrl === '/admin/employer-verifications') {
    const employers = getDB(STORAGE_KEYS.USERS).filter(u => u.role === 'employer' && !u.verified);
    return success(employers);
  }

  const adminVerifyMatch = cleanUrl.match(/\/admin\/employers\/([a-zA-Z0-9\-]+)\/verify/);
  if (method === 'put' && adminVerifyMatch) {
    const empId = adminVerifyMatch[1];
    const { status } = data;
    const users = getDB(STORAGE_KEYS.USERS);
    const target = users.find(u => u._id === empId);
    if (target) {
      target.verified = status === 'approved';
      setDB(STORAGE_KEYS.USERS, users);
    }
    return successMsg('Employer verification updated successfully');
  }

  if (method === 'get' && cleanUrl === '/admin/jobs') {
    const jobs = getDB(STORAGE_KEYS.JOBS);
    return success(jobs);
  }

  const adminJobDelete = cleanUrl.match(/\/admin\/jobs\/([a-zA-Z0-9\-]+)/);
  if (method === 'delete' && adminJobDelete) {
    const jobId = adminJobDelete[1];
    let jobs = getDB(STORAGE_KEYS.JOBS);
    jobs = jobs.filter(j => j._id !== jobId);
    setDB(STORAGE_KEYS.JOBS, jobs);
    return successMsg('Job deleted by Admin');
  }

  const adminUserDelete = cleanUrl.match(/\/admin\/users\/([a-zA-Z0-9\-]+)/);
  if (method === 'delete' && adminUserDelete) {
    const userId = adminUserDelete[1];
    let users = getDB(STORAGE_KEYS.USERS);
    users = users.filter(u => u._id !== userId);
    setDB(STORAGE_KEYS.USERS, users);
    return successMsg('User deleted by Admin');
  }

  if (cleanUrl === '/admin/reports') {
    return success([
      { _id: 'rep-1', reporter: 'Jane Doe', reason: 'Spam listing', targetId: 'job-4', type: 'job', createdAt: new Date().toISOString() }
    ]);
  }

  // Fallback
  return failure(`Mock route not found: ${method} ${cleanUrl}`);
};
