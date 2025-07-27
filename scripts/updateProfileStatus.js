import { updateAllUsersProfileStatus } from '../src/utils/updateProfileStatus.js';

async function main() {
    try {
        console.log('Starting profile completion status update...');
        const results = await updateAllUsersProfileStatus();
        console.log('Profile completion status update completed successfully!');
        console.log('Updated users:', results);
    } catch (error) {
        console.error('Error updating profile completion status:', error);
        process.exit(1);
    }
}

main(); 