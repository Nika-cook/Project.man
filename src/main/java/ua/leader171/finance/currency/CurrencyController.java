package ua.leader171.finance.currency;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.client.RestTemplate;

@RestController
@RequestMapping("/api/currencies")
public class CurrencyController {

    @Autowired
    private  RestTemplate restTemplate;

    @GetMapping
    public String getCurrencies() {
        String url = "https://api.privatbank.ua/p24api/pubinfo?json&exchange&coursid=5";
        return  restTemplate.getForObject(url, String.class);
    }

}
