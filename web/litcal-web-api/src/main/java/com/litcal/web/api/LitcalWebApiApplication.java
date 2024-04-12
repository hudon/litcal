package com.litcal.web.api;

import com.litcal.litdb.LitCalendar;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

import java.lang.foreign.*;

@SpringBootApplication
public class LitcalWebApiApplication {

    public static void main(String[] args) {
        SpringApplication.run(LitcalWebApiApplication.class, args);

        System.out.println(STR."hello world! \{LitCalendar.foo()}");
    }

}
