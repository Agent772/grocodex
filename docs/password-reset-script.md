# Password Reset Script for Grocodex

This script allows a sysadmin to list all users and reset any user's password (including admin) from inside the Docker container. This is useful for account recovery or emergency password resets if all access is lost.

## Usage

1. **Enter the backend container shell:**
   ```bash
   docker exec -it <container_name> /bin/sh
   ```

2. **Run the script using ts-node:**
   ```bash
   npx ts-node scripts/resetUserPassword.ts
   ```
   Or, if compiled:
   ```bash
   node dist/scripts/resetUserPassword.js
   ```

3. **Follow the prompts:**
   - The script will list all usernames.
   - Enter the username whose password you want to reset.
   - Enter the new password when prompted.

## Security Notes
- This script does not expose any HTTP endpoints and must be run manually inside the container.
- Only use this script from a trusted shell session.
- Passwords are hashed using bcrypt before being stored in the database.

## Example Output
```
Users:
- admin
- alice
- bob
Enter username to reset password: admin
Enter new password: ********
Password for user 'admin' has been reset.
```
