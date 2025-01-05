package ua.leader171.finance.transaction;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import ua.leader171.finance.user.AppUser;
import ua.leader171.finance.user.UserService;

import java.time.LocalDate;
import java.util.List;
import java.util.Objects;
import java.util.Optional;

@RestController
@RequestMapping("/api/transactions")
public class TransactionController {
    @Autowired
    private TransactionService transactionService;
    @Autowired
    private UserService userService;

    @PostMapping("/{username}")
    public ResponseEntity<AppTransaction> addTransaction(@PathVariable String username, @RequestBody AppTransaction transaction, @AuthenticationPrincipal UserDetails userDetails) {
        if (!Objects.equals(userDetails.getUsername(), username) && !userDetails.getAuthorities().contains(new SimpleGrantedAuthority("ROLE_ADMIN"))) {
            return ResponseEntity.notFound().build();
        }
        Optional<AppUser> user = userService.getUserByUsername(username);
        if (user.isPresent()) {
            transaction.setAppUser(user.get());
            AppTransaction newAppTransaction = transactionService.createTransaction(transaction);
            return ResponseEntity.ok(newAppTransaction);
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/{username}")
    public ResponseEntity<List<AppTransaction>> getTransactions(@PathVariable String username, @AuthenticationPrincipal UserDetails userDetails) {
        if (!Objects.equals(userDetails.getUsername(), username) && !userDetails.getAuthorities().contains(new SimpleGrantedAuthority("ROLE_ADMIN"))) {
            return ResponseEntity.notFound().build();
        }
        Optional<AppUser> user = userService.getUserByUsername(username);
        return user.map(value -> ResponseEntity.ok(transactionService.getUserTransactions(value)))
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @GetMapping("/{username}/range")
    public ResponseEntity<List<AppTransaction>> getTransactionsByDateRange(
            @PathVariable String username,
            @RequestParam("startDate") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam("endDate") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate, @AuthenticationPrincipal UserDetails userDetails) {
        if (!Objects.equals(userDetails.getUsername(), username) && !userDetails.getAuthorities().contains(new SimpleGrantedAuthority("ROLE_ADMIN"))) {
            return ResponseEntity.notFound().build();
        }

        Optional<AppUser> user = userService.getUserByUsername(username);
        if (user.isPresent()) {
            List<AppTransaction> transactions = transactionService.getUserTransactionsByDateRange(user.get(), startDate, endDate);
            return ResponseEntity.ok(transactions);
        } else {
            return ResponseEntity.notFound().build();
        }
    }
}