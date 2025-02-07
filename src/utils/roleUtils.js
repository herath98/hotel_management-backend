export const canUpdateUser = (updaterRole, currentUserRole, newRole) => {
    // Define role hierarchy
    const roleHierarchy = {
        admin: ['admin', 'manager', 'staff'],
        manager: ['staff'],
        staff: []
    };

    // Get allowed roles for the updater
    const allowedRoles = roleHierarchy[updaterRole] || [];

    // Check if updater can modify both current and new roles
    return allowedRoles.includes(currentUserRole) && allowedRoles.includes(newRole);
};