package ua.leader171.finance.transaction;

import org.springframework.data.jpa.repository.JpaRepository;
import ua.leader171.finance.user.AppUser;

import java.time.LocalDate;
import java.util.List;

public interface TransactionRepository extends JpaRepository<AppTransaction, Long> {
    List<AppTransaction> findByAppUserOrderByDateDesc(AppUser appUser);

    List<AppTransaction> findByAppUserAndDateBetween(AppUser appUser, LocalDate startDate, LocalDate endDate);

}
