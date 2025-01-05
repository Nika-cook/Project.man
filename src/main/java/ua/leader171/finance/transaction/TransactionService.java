package ua.leader171.finance.transaction;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import ua.leader171.finance.user.AppUser;

import java.time.LocalDate;
import java.util.List;

@Service
public class TransactionService {
    @Autowired
    private TransactionRepository transactionRepository;

    public AppTransaction createTransaction(AppTransaction transaction) {
        return transactionRepository.save(transaction);
    }

    public List<AppTransaction> getUserTransactions(AppUser appUser) {
        return transactionRepository.findByAppUserOrderByDateDesc(appUser);
    }

    public List<AppTransaction> getUserTransactionsByDateRange(AppUser appUser, LocalDate startDate, LocalDate endDate) {
        return transactionRepository.findByAppUserAndDateBetween(appUser, startDate, endDate);
    }
}
