/**
 * AS Pharmacy - Components Module (PHP Backend Version)
 * Dynamically injects Sidebar and Topbar
 */

const Components = {
    async renderSidebar(activePage) {
        // Wait for session to be ready
        await Storage.init();
        const user = Storage.getCurrentUser();
        if (!user) {
            window.location.href = 'login.html';
            return;
        }

        const initials = user.name.split(' ').map(n => n[0]).join('');
        
        const sidebarHtml = `
            <div class="sidebar">
                <div class="sidebar-header">
                    <div class="sidebar-logo-icon">
                        <i class="fa-solid fa-briefcase-medical"></i>
                    </div>
                    <div class="sidebar-logo-text">AS Pharmacy</div>
                </div>
                
                <nav class="sidebar-nav">
                    <div class="nav-label">Main Menu</div>
                    <a href="dashboard.html" class="nav-link ${activePage === 'dashboard' ? 'active' : ''}">
                        <i class="fa-solid fa-gauge-high"></i>
                        <span>Dashboard</span>
                    </a>
                    <a href="inventory.html" class="nav-link ${activePage === 'inventory' ? 'active' : ''}">
                        <i class="fa-solid fa-boxes-stacked"></i>
                        <span>Inventory</span>
                    </a>
                    <a href="billing.html" class="nav-link ${activePage === 'billing' ? 'active' : ''}">
                        <i class="fa-solid fa-file-invoice-dollar"></i>
                        <span>Billing</span>
                    </a>
                    <a href="sales.html" class="nav-link ${activePage === 'sales' ? 'active' : ''}">
                        <i class="fa-solid fa-clock-rotate-left"></i>
                        <span>Sales History</span>
                    </a>
                    <a href="attendance.html" class="nav-link ${activePage === 'attendance' ? 'active' : ''}">
                        <i class="fa-solid fa-clipboard-user"></i>
                        <span>Attendance</span>
                    </a>
                    
                    <div class="nav-label" style="margin-top: 1.5rem;">Analytics</div>
                    <a href="reports.html" class="nav-link ${activePage === 'reports' ? 'active' : ''}">
                        <i class="fa-solid fa-chart-line"></i>
                        <span>Reports</span>
                    </a>

                    ${user.role === 'admin' ? `
                        <div class="nav-label" style="margin-top: 1.5rem;">Administration</div>
                        <a href="admin.html" class="nav-link ${activePage === 'admin' ? 'active' : ''}">
                            <i class="fa-solid fa-user-shield"></i>
                            <span>Admin Panel</span>
                        </a>
                    ` : ''}
                </nav>

                <div class="sidebar-footer">
                    <div class="user-profile" onclick="toggleUserDropdown()">
                        <div class="user-avatar">${initials}</div>
                        <div class="user-info">
                            <span class="user-name">${user.name}</span>
                            <span class="user-role">${user.role.toUpperCase()}</span>
                        </div>
                        <i class="fa-solid fa-chevron-up" style="font-size: 0.7rem; opacity: 0.5;"></i>
                    </div>
                </div>
            </div>
        `;
        
        const container = document.querySelector('.app-container') || document.body;
        if (container) {
            container.insertAdjacentHTML('afterbegin', sidebarHtml);
        }
        
        this.renderScrollNav();
    },

    renderScrollNav() {
        if (document.querySelector('.auth-page')) return;
        if (document.querySelector('.scroll-nav')) return;
        
        const navHtml = `
            <div class="scroll-nav">
                <button class="scroll-btn" onclick="window.scrollTo({top: 0, behavior: 'smooth'})" title="Page Up">
                    <i class="fa-solid fa-chevron-up"></i>
                </button>
                <button class="scroll-btn" onclick="window.scrollTo({top: document.body.scrollHeight, behavior: 'smooth'})" title="Page Down">
                    <i class="fa-solid fa-chevron-down"></i>
                </button>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', navHtml);
    },

    async renderTopbar(pageTitle) {
        const topbarHtml = `
            <header class="topbar">
                <div class="page-info">
                    <h1>${pageTitle}</h1>
                </div>
                
                <div class="topbar-actions">
                    <div class="action-btn" title="Toggle Theme" onclick="UI.toggleTheme()">
                        <i class="fa-solid fa-moon"></i>
                    </div>
                    <div class="action-btn" title="Notifications" onclick="Components.toggleNotifications(event)">
                        <i class="fa-solid fa-bell"></i>
                        <span id="notifBadge" class="notification-badge"></span>
                    </div>
                    <div class="action-btn" title="Logout" onclick="Storage.logout()">
                        <i class="fa-solid fa-right-from-bracket"></i>
                    </div>
                </div>

                <div id="notifDropdown" class="notification-dropdown">
                    <div class="notif-header">
                        <h4 style="font-size: 0.95rem;">Notifications</h4>
                        <span id="notifCount" style="font-size: 0.75rem; color: var(--text-muted);">0 New</span>
                    </div>
                    <div id="notifList" class="notif-list">
                        <div style="padding: 2rem; text-align: center; color: var(--text-light); font-size: 0.85rem;">Loading...</div>
                    </div>
                </div>
            </header>
        `;
        
        const wrapper = document.querySelector('.main-wrapper');
        if (wrapper) {
            wrapper.insertAdjacentHTML('afterbegin', topbarHtml);
            await this.updateNotificationState();
        }

        document.addEventListener('click', (e) => {
            const dropdown = document.getElementById('notifDropdown');
            if (dropdown && !dropdown.contains(e.target) && !e.target.closest('.action-btn')) {
                dropdown.classList.remove('open');
            }
        });
    },

    toggleNotifications(event) {
        event.stopPropagation();
        const dropdown = document.getElementById('notifDropdown');
        dropdown.classList.toggle('open');
        this.updateNotificationState();
    },

    async updateNotificationState() {
        const meds = await Storage.fetch(DB.MEDS);
        const today = new Date();
        const threeMonthsFromNow = new Date();
        threeMonthsFromNow.setMonth(today.getMonth() + 3);

        const alerts = [];

        meds.forEach(m => {
            if (m.qty < 10) {
                alerts.push({
                    type: 'low-stock',
                    medId: m.id,
                    title: 'Low Stock Alert',
                    message: `${m.name} is low on stock (${m.qty} left)`,
                    icon: 'fa-boxes-stacked',
                    color: '#ef4444'
                });
            }
            
            const expiry = new Date(m.expiry);
            if (expiry <= threeMonthsFromNow && expiry >= today) {
                const diffDays = Math.ceil(Math.abs(expiry - today) / (1000 * 60 * 60 * 24));
                alerts.push({
                    type: 'expiry',
                    medId: m.id,
                    title: 'Expiry Warning',
                    message: `${m.name} will expire in ${diffDays} days`,
                    icon: 'fa-hourglass-half',
                    color: '#f59e0b'
                });
            }
        });

        const badge = document.getElementById('notifBadge');
        const count = document.getElementById('notifCount');
        const list  = document.getElementById('notifList');

        if (badge) badge.classList.toggle('active', alerts.length > 0);
        if (count) count.innerText = `${alerts.length} Alerts`;

        if (list) {
            if (alerts.length === 0) {
                list.innerHTML = '<div style="padding: 2rem; text-align: center; color: var(--text-light); font-size: 0.85rem;">No new notifications</div>';
            } else {
                list.innerHTML = alerts.map(a => `
                    <div class="notif-item" onclick="window.location.href='inventory.html?highlight=${a.medId}'" style="cursor: pointer;">
                        <div class="notif-icon" style="background: ${a.color}15; color: ${a.color};">
                            <i class="fa-solid ${a.icon}"></i>
                        </div>
                        <div class="notif-info">
                            <p style="font-size: 0.85rem; font-weight: 600; margin-bottom: 0.15rem;">${a.title}</p>
                            <p style="font-size: 0.75rem; color: var(--text-muted); line-height: 1.3;">${a.message}</p>
                        </div>
                    </div>
                `).join('');
            }
        }
    }
};

const UI = {
    async toggleTheme() {
        const current = document.documentElement.getAttribute('data-theme');
        const next = current === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', next);
        await Storage.set(DB.SETTINGS, { theme: next });
        const icon = document.querySelector('.action-btn i.fa-moon, .action-btn i.fa-sun');
        if (icon) icon.className = next === 'dark' ? 'fa-solid fa-sun' : 'fa-solid fa-moon';
    },

    async initTheme() {
        try {
            const settings = await _api('settings.php');
            if (settings && settings.theme === 'dark') {
                document.documentElement.setAttribute('data-theme', 'dark');
            }
        } catch(e) {
            // fallback: no theme change
        }
    }
};

UI.initTheme();
Components.renderScrollNav();
