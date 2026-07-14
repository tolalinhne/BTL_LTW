package com.lilifashion;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

/**
 * Chạy file này để generate BCrypt hash cho password bất kỳ.
 * Dùng lệnh: mvn exec:java -Dexec.mainClass="com.lilifashion.GenerateHash"
 */
public class GenerateHash {
    public static void main(String[] args) {
        BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();
        
        String[] passwords = {"123456", "Admin@123", "password"};
        
        for (String pwd : passwords) {
            String hash = encoder.encode(pwd);
            System.out.println("Password: " + pwd);
            System.out.println("Hash:     " + hash);
            System.out.println("Verify:   " + encoder.matches(pwd, hash));
            System.out.println("---");
        }
    }
}
