//
//  litcal_darwinApp.swift
//  litcal-darwin
//
//  Created by James Hudon on 6/27/22.
//

import SwiftUI


@main
struct litcal_darwinApp: App {
    @StateObject private var litViewModel = try! LitCalendarViewModel()
    var body: some Scene {
        WindowGroup {
            ContentView(selectedDateSeconds: litViewModel.todaySeconds)
                .environmentObject(litViewModel)
        }
    }
}
