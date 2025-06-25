# Codebook Project README

<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Codebook: Developer's Social Coding Universe</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/plotly.js/dist/plotly.min.js"></script>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;600;700&display=swap');
        body {
            font-family: 'Poppins', sans-serif;
            background-color: #F7FFF7; /* Accent 1 */
            color: #2C3E50; /* Text */
        }
        .text-primary-red { color: #FF6B6B; }
        .bg-primary-red { background-color: #FF6B6B; }
        .text-secondary-teal { color: #4ECDC4; }
        .bg-secondary-teal { background-color: #4ECDC4; }
        .text-accent-yellow { color: #FFE66D; }
        .bg-accent-yellow { background-color: #FFE66D; }

        .chart-container {
            position: relative;
            width: 100%;
            max-width: 700px; /* Adjusted max-width for better readability on larger screens */
            margin-left: auto;
            margin-right: auto;
            height: 350px; /* Base height */
            max-height: 450px; /* Max height to prevent excessive vertical stretch */
        }
        @media (max-width: 768px) {
            .chart-container {
                height: 300px; /* Slightly smaller height on mobile */
                max-height: 400px;
            }
        }
        .flow-node {
            @apply bg-white p-4 rounded-lg shadow-md border-b-4 border-secondary-teal text-center font-semibold;
        }
        .flow-arrow {
            @apply text-secondary-teal text-5xl;
        }
        .card {
            @apply bg-white rounded-lg shadow-md p-6 mb-6;
        }
        .section-title {
            @apply text-4xl font-bold text-primary-red mb-6;
        }
        .section-subtitle {
            @apply text-xl font-semibold text-secondary-teal mb-4;
        }
        .stat-box {
            @apply flex flex-col items-center justify-center bg-secondary-teal rounded-lg p-6 shadow-xl text-white;
        }
        .stat-number {
            @apply text-6xl font-extrabold;
        }
        .stat-label {
            @apply text-lg mt-2 text-center;
        }
    </style>
</head>
<body class="p-8">

    <header class="text-center mb-12">
        <h1 class="text-6xl font-extrabold text-primary-red leading-tight">Codebook: <br class="md:hidden"> A Developer's Social Coding Universe</h1>
        <p class="text-xl mt-4 text-gray-700 max-w-3xl mx-auto">
            Codebook is a vibrant blog platform designed exclusively for developers to connect, share code, and exchange insights. Built with a powerful and modern stack, it's the go-to place for all things development.
        </p>
    </header>

    <main class="max-w-7xl mx-auto">
        <section class="mb-16 card">
            <h2 class="section-title">At a Glance: The Power of Codebook</h2>
            <p class="mb-8 text-lg">
                Codebook is more than just a blogging platform; it's a comprehensive ecosystem designed to empower developers. Here's a quick overview of what makes it stand out.
            </p>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div class="stat-box">
                    <div class="stat-number">3+</div>
                    <div class="stat-label">Core Technologies Powering Innovation</div>
                </div>
                <div class="stat-box bg-primary-red">
                    <div class="stat-number">15+</div>
                    <div class="stat-label">Key Features for a Rich User Experience</div>
                </div>
                <div class="stat-box">
                    <div class="stat-number">1</div>
                    <div class="stat-label">Unified Platform for Developer Collaboration</div>
                </div>
            </div>
        </section>

        <hr class="border-t-2 border-secondary-teal my-16">

        <section class="mb-16 card">
            <h2 class="section-title">The Codebook Journey: A Feature Ecosystem</h2>
            <p class="mb-8 text-lg">
                Codebook offers a complete user journey, starting from secure registration to dynamic content interaction. The platform's features are interconnected, providing a seamless experience for developers.
            </p>
            <div class="flex flex-col items-center justify-center p-4">
                <div class="flow-node">User Management & Authentication</div>
                <div class="flow-arrow my-4">&darr;</div>
                <div class="flow-node">Personalized Dashboard & Settings</div>
                <div class="flow-arrow my-4">&darr;</div>
                <div class="flow-node">Dynamic Blog Management & Creation</div>
                <div class="flow-arrow my-4">&darr;</div>
                <div class="flow-node">Engaging Social & Interaction Features</div>
                <div class="flow-arrow my-4">&darr;</div>
                <div class="flow-node">Real-Time Notifications & Community Building</div>
            </div>
        </section>

        <hr class="border-t-2 border-secondary-teal my-16">

        <section class="mb-16 card">
            <h2 class="section-title">Feature Breakdown: What Codebook Offers</h2>
            <p class="mb-8 text-lg">
                Each core area of Codebook is packed with specific functionalities designed to meet the needs of a modern developer. Here's a look at the distribution of features across key categories.
            </p>
            <div class="chart-container">
                <canvas id="featureBreakdownChart"></canvas>
            </div>
            <p class="mt-4 text-center text-gray-600">
                This bar chart illustrates the number of distinct functionalities provided within each major feature category, highlighting the depth of features in Blog Management & Interaction.
            </p>
        </section>

        <hr class="border-t-2 border-secondary-teal my-16">

        <section class="mb-16 card">
            <h2 class="section-title">Driving Engagement: How Developers Interact</h2>
            <p class="mb-8 text-lg">
                Engagement is at the heart of Codebook. Our platform fosters interaction through likes, comments, and the ability to follow other developers, creating a vibrant community.
            </p>
            <div class="chart-container h-80 max-h-96">
                <canvas id="engagementChart"></canvas>
            </div>
            <p class="mt-4 text-center text-gray-600">
                This donut chart provides a hypothetical breakdown of typical user interactions on Codebook, demonstrating the various ways developers engage with content and each other.
            </p>
        </section>

        <hr class="border-t-2 border-secondary-teal my-16">

        <section class="mb-16 card">
            <h2 class="section-title">Under the Hood: Our Robust Technology Stack</h2>
            <p class="mb-8 text-lg">
                Codebook is powered by a modern, scalable, and efficient technology stack, ensuring a responsive and reliable experience for all users. We leverage the power of the MERN stack with Vue.js.
            </p>
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div class="bg-white p-6 rounded-lg shadow-md flex flex-col items-center text-center border-b-4 border-primary-red">
                    <span class="text-6xl mb-4" role="img" aria-label="Vue.js logo">&#x2699;&#xFE0F;</span>
                    <h3 class="text-xl font-semibold mb-2">Vue.js</h3>
                    <p class="text-gray-600">Progressive JavaScript Framework for dynamic UIs.</p>
                </div>
                <div class="bg-white p-6 rounded-lg shadow-md flex flex-col items-center text-center border-b-4 border-secondary-teal">
                    <span class="text-6xl mb-4" role="img" aria-label="Node.js logo">&#x26A1;</span>
                    <h3 class="text-xl font-semibold mb-2">Node.js</h3>
                    <p class="text-gray-600">Server-side JavaScript runtime for scalable applications.</p>
                </div>
                <div class="bg-white p-6 rounded-lg shadow-md flex flex-col items-center text-center border-b-4 border-accent-yellow">
                    <span class="text-6xl mb-4" role="img" aria-label="Express.js logo">&#x1F680;</span>
                    <h3 class="text-xl font-semibold mb-2">Express.js</h3>
                    <p class="text-gray-600">Fast, unopinionated, minimalist web framework for Node.js.</p>
                </div>
                <div class="bg-white p-6 rounded-lg shadow-md flex flex-col items-center text-center border-b-4 border-primary-red">
                    <span class="text-6xl mb-4" role="img" aria-label="MongoDB logo">&#x1F4A1;</span>
                    <h3 class="text-xl font-semibold mb-2">MongoDB</h3>
                    <p class="text-gray-600">NoSQL document database for flexible data storage.</p>
                </div>
            </div>
        </section>

        <hr class="border-t-2 border-secondary-teal my-16">

        <section class="mb-16 card">
            <h2 class="section-title">Stay Connected: Real-Time Notification Flow</h2>
            <p class="mb-8 text-lg">
                Never miss an update! Codebook's real-time notification system keeps you informed about key interactions and activities, accessible via a dedicated page and navbar drawer.
            </p>
            <div class="flex flex-col items-center justify-center p-4">
                <div class="flow-node max-w-xs md:max-w-md">User Activity (Post, Like, Comment, Reply)</div>
                <div class="flow-arrow my-4">&darr;</div>
                <div class="flow-node max-w-xs md:max-w-md">Backend Processes Notification Event</div>
                <div class="flow-arrow my-4">&darr;</div>
                <div class="flow-node max-w-xs md:max-w-md">Real-Time Notification Delivery</div>
                <div class="flow-arrow my-4">&darr;</div>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-md">
                    <div class="flow-node">Dedicated Notifications Page</div>
                    <div class="flow-node">Navbar Drawer Notification</div>
                </div>
            </div>
        </section>

    </main>

    <footer class="text-center mt-16 py-8 text-gray-600 border-t border-gray-300">
        <p>&copy; 2025 Codebook Project. All rights reserved. | Built with Vue.js, Node.js, Express.js, MongoDB & Tailwind CSS.</p>
    </footer>

    <script>
        // Function to wrap long labels for Chart.js
        function wrapLabel(label, maxCharPerLine = 16) {
            if (typeof label !== 'string' || label.length <= maxCharPerLine) {
                return label;
            }
            const words = label.split(' ');
            const lines = [];
            let currentLine = '';

            words.forEach(word => {
                if ((currentLine + word).length <= maxCharPerLine) {
                    currentLine += (currentLine === '' ? '' : ' ') + word;
                } else {
                    lines.push(currentLine);
                    currentLine = word;
                }
            });
            lines.push(currentLine);
            return lines;
        }

        // Chart.js Feature Breakdown Chart
        const featureBreakdownCtx = document.getElementById('featureBreakdownChart').getContext('2d');
        const featureBreakdownChart = new Chart(featureBreakdownCtx, {
            type: 'bar',
            data: {
                labels: [
                    wrapLabel('User Management & Authentication'),
                    wrapLabel('User Dashboard & Settings'),
                    wrapLabel('Blog Management & Interaction'),
                    wrapLabel('User Profile Features'),
                    wrapLabel('Real-Time Notifications')
                ],
                datasets: [{
                    label: 'Number of Sub-Features',
                    data: [5, 2, 6, 2, 4], // Data from source material (adjusted for 4 notification types)
                    backgroundColor: [
                        '#FF6B6B', // Red
                        '#4ECDC4', // Teal
                        '#FFE66D', // Yellow
                        '#FF6B6B', // Red
                        '#4ECDC4'  // Teal
                    ],
                    borderColor: [
                        '#E05D5D',
                        '#3BBBAF',
                        '#DED560',
                        '#E05D5D',
                        '#3BBBAF'
                    ],
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                indexAxis: 'y', // Horizontal bars
                scales: {
                    x: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Count of Features'
                        }
                    },
                    y: {
                        ticks: {
                            autoSkip: false // Ensures all labels are shown
                        }
                    }
                },
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        callbacks: {
                            title: function(tooltipItems) {
                                const item = tooltipItems[0];
                                let label = item.chart.data.labels[item.dataIndex];
                                if (Array.isArray(label)) {
                                  return label.join(' ');
                                } else {
                                  return label;
                                }
                            }
                        }
                    }
                }
            }
        });

        // Chart.js Engagement Chart
        const engagementCtx = document.getElementById('engagementChart').getContext('2d');
        const engagementChart = new Chart(engagementCtx, {
            type: 'doughnut',
            data: {
                labels: ['Likes', 'Comments', 'Follows', 'Blog Views'],
                datasets: [{
                    label: 'User Interaction Breakdown',
                    data: [40, 25, 15, 20], // Hypothetical distribution
                    backgroundColor: [
                        '#FF6B6B', // Red
                        '#4ECDC4', // Teal
                        '#FFE66D', // Yellow
                        '#2C3E50'  // Dark Blue/Gray
                    ],
                    borderColor: '#F7FFF7', // Accent 1 (background color) for border
                    borderWidth: 2
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                cutout: '70%', // Make it a donut chart
                plugins: {
                    legend: {
                        position: 'right',
                        labels: {
                            boxWidth: 20
                        }
                    },
                    tooltip: {
                        callbacks: {
                            title: function(tooltipItems) {
                                const item = tooltipItems[0];
                                let label = item.chart.data.labels[item.dataIndex];
                                if (Array.isArray(label)) {
                                  return label.join(' ');
                                } else {
                                  return label;
                                }
                            },
                            label: function(context) {
                                let label = context.label || '';
                                if (label) {
                                    label += ': ';
                                }
                                if (context.parsed !== null) {
                                    label += context.parsed + '%';
                                }
                                return label;
                            }
                        }
                    }
                }
            }
        });
    </script>
</body>
</html>