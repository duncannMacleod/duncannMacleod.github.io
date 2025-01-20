from nicegui import ui

def supervisor_dashboard():
    with ui.card():
        ui.label('Mode Superviseur')
        ui.label('Dashboard avec statistiques et graphiques')
        ui.label('Gestion des utilisateurs')
        ui.label('Logs système')

def editor_dashboard():
    with ui.card():
        ui.label('Mode Éditeur')
        ui.label('Édition de contenu avec outil WYSIWYG')
        ui.label('Bibliothèque de médias')
        ui.label('Prévisualisation en direct')

@ui.page('/superviseur')
def supervisor_page():
    supervisor_dashboard()

@ui.page('/editeur')
def editor_page():
    editor_dashboard()

ui.run()
