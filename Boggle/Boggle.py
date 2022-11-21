#Crée par Stéphane Toyo Demanou, TS2, Projet isn 2018: Jeu de Boggle
#-*- coding: utf-8 -*-
#~~~~~~~~~~~~~~~~~~~~~~~~~#
# IMPORTATION DES MODULES #
#~~~~~~~~~~~~~~~~~~~~~~~~~#
from tkinter import*
from random import*
from time import*
from tkinter.messagebox import*
#from pygame.locals import *
#from pygame import*

#~~~~~~~~~~~~~~~~~~~~~~~~~#
#~~~~~FICHIERS SONORES~~~~#
#~~~~~~~~~~~~~~~~~~~~~~~~~#

"""mixer.init()
Wrong = mixer.Sound("1937.wav")
Right = mixer.Sound("2360.wav")
Gagné = mixer.Sound("3069.wav")
Perdu = mixer.Sound("829.wav")
Ultra = mixer.Sound("DBS.wav")"""

#~~~~~~~~~~~#
# FONCTIONS #
#~~~~~~~~~~~#
#Ultra.play()

def Grille():       #fonction de création de la grille de jeu
    global P1, P2
    for i in range (4):
        for j in range (4):

            x1=2
            y1=2
            #coordonnées x1 et y1 pour la création des rectangles
            P1=(x1+j*70, y1 + i*70)
            #coordonnées x2 y2
            P2=(x1+(j+1)*70, y1 + (i+1)*70)
            can.create_rectangle(P1,P2, fill='white', tag ="DE")   #Liste contenant les identifiants numériques des cases crées (l'ordre de création de chaque rectangles)

##   can.itemconfig(ListDeCan[event.x][], fill="red")

def Place_lettres(): # fonction qui place les lettres dans la grille du Canevas
    global tag1
    x=-35
    y=-35
    for i in range (4):
        for j in range(4):
            #cordonnées x et y du texte à placer
                P1= x+70 + i*70, y+70 + j*70
                # on affecte au texte créé dans le Canevas d'un tag "TXT" pour pouvoir bind ce texte avec le clique droit de la souris
                ListDeCan[i][j] = can.create_text(P1,text=Tirage(), font=('ArialBlack', '35', 'bold'), tag="TXT")

#Liste contenant les identifiants numériques des lettres crées (l'ordre de création de chaque lettres)
ListDeCan = [["" for i in range(4)] for j in range(4)]

def Tirage():           #fonction qui tire au hasard 16 lettres dans 16 dés représentés par un dictionnaire
#16 dés, 16 lettres, don une boucle qui réitère 16 fois la procédure de choix des lettres
 for i in range(16):
    boggle = { 1:['E', 'T', 'U', 'K', 'N', 'O'], 2:['E', 'V', 'G', 'T', 'I', 'N'],3:['D', 'E', 'C', 'A', 'M', 'P'],
    4:['I', 'E', 'L', 'R', 'U', 'W'], 5:['N', 'A', 'V', 'E', 'D', 'Z'], 6:['E', 'I', 'O', 'A', 'T', 'A'], 7:['G', 'L', 'E', 'N', 'Y', 'U'],
    8:['O', 'F', 'X', 'R', 'I', 'A'], 9:['E', 'I', 'O', 'A', 'T', 'A'], 10:['G', 'L', 'E', 'N', 'Y', 'U'],
    11:['B', 'M', 'A', 'Q', 'J', 'O'], 12:['T', 'L', 'I', 'B', 'R', 'A'],13 :['S', 'P', 'U', 'L', 'T', 'E'],
    14:['A', 'I', 'M', 'S', 'O', 'R'], 15:['E', 'N', 'H', 'R', 'I', 'S'], 16:['E', 'T', 'U', 'K', 'N', 'O'] }
    #on choisi aléatoirement une clé avec randint(1,16) puis on choisit avec choice() une valeur au hasard
    lst = choice(boggle[randint(1,16)])
    #on remplace le caractère espace par rien
    lst = lst.replace("\n","")
    return lst


def Select_Mots(event):     #fonction qui nous permet de cliquer sur les cases, et de créer des mots
    global Lettre, Ident, mot
    #Ident est l'indentifiant numérique de l'objet avec le tag CURRENT (l'objet sur lequel on clique), en l'occurence ici les lettres
    Ident = can.find_withtag(CURRENT)[0]
    #On utilise can.itemcget() pour récupérer la lettre (Lettre)
    Lettre = can.itemcget(Ident, "text")
    # création du mot en rajoutant la lettre obtenue en cliquant sur une case à chaque fois
    mot=mot+Lettre
    #Tests
    print(mot)
    print(Ident)
    #on utilise MOT.set(mot) pour lui donner la valeur de la variable mot formée plus haut
    MOT.set(mot)
    Msg.set("")

    return()
#Au départ, la varibale mot est vide, voilà pourquoi nous avons écrit mot=""
mot=""


# fonction ajouter assez lourde puisqu'elle s'occupe de vérifier que les mots sont bien dans la liste et de compter les points du joueur
def Ajouter():
    global mot, Vérif, score, Msg, Lettre
    #Vérif est une variable booléenne qui affichera True ou False selon si le mot est dans la liste ou non
    Vérif = bool
    #ouverture de la liste de mot sur fichier externe
    file = open("mots_boggle.txt", "r+")
    lst=""
     # on lit la liste de mot du fichier externe sur une chaîne de caractères vierge
    lst = file.read()
    # Le mot entré en cliquant sur le Button Ajouter doit faire 4 lettres minimum sinon il n'est pas traité
    if len(mot) >= 4:
        # Si le mot n'est pas dns la liste
        if mot not in lst:
            #Wrong.play()
            #Vérif prend la valeur False
            Vérif = False
            #Le message Msg affiché au joueur sera le suivant si le mot n'est pas dans la liste
            Msg.set("Ce mot ne se trouve pas dans la liste")
            # Le score baisse d'un point si l'on rentre un mot ne se trouvant pas dans la liste
            score-=1
            # Si le mot se trouve dans la liste ...
        elif mot in lst:
           # Right.play()
            #Vérif prend la valeur True
            Vérif = True
            #Le message Msg affiché au joueur sera le suivant si le mot est dans la liste
            Msg.set("Bien! Et un mot de plus!!")
            #On analyse la longueur du mot...
            #...pour ajouter les points en conséquence (voir règles du jeu)
            if len(mot)==4:
                score+=1
            elif len(mot)==5:
                score+=2
            elif len(mot)==6:
                score+=3
            elif len(mot)==7:
                score+=5
            elif len(mot) in range (8,12):
                score+=11
    else:
        # Le mot DOIT faire 4 lettres minimum ou bien un message d'erreur s'affiche
        showwarning("Résultat","Le mot doit faire minimum 4 lettres!!. \nVeuillez recommencer !")
        # Puisque le mot entré ne fait pas 4lettres minimum, on efface la séléction de l'Entry
        e.delete(0, END)
        # A chaque fois qu'on ajoute un mot pour le tester, on efface le champ de saisie Entry et donc la variable MOT en question
    e.delete(0, END)
    # Idem, on efface la variable mot après qu'il ait été testé
    mot=""
    #On appelle la fonction Win_Loose pour tester si le joueur a gagné ou pas
    Win_Loose()
    return
#on fixe le score de départ à zéro évidemment
score=0

def Win_Loose():   #fonction qui teste si le joueur a gagné ou perdu
    global score, MOT, mot, Vérif
    #Si le score du joueur dépasse 30 points
    if score>15:
        #On joue la musique de la victoire
        #Gagné.play()
        #Ultra.stop()
        #On affiche un message qui indique au joueur qu'il a gagné
        showinfo("Félicitations", "Vous avez GAGNE!!!")
        #on efface la barre d'entrée
        e.delete(0, END)
        #on efface le mot
        mot=""
        #on ferme la fenêtre
        fen.destroy()
    #Si le temps impartit est écoulé
    """elif Time()==0:
        #On joue la musiqe de la défaite
        Ultra.stop()
        Perdu.play()
        #On affiche un message qui indique au joueur qu'il a perdu
        showinfo("Le temps impartit est écoulé!", "Vous avez PERDU!!!")
        #la fenêtre se ferme
        fen.destroy()

 Ceci est la foncion chronomètre qui devait servir de compte à rebours ppour le joueur et
lui indiquer s'il avait perdu ou non
def Time(Start_Time):

 Actual_Time.set(time-Start_Time) # On importe le temps du début et on
 round(Actual_Time, 0)
 return Actual_Time
print(Actual_Time)"""


def Nouveau():   # fonction Nouvelle Grille
    global mot
    #on efface la grille et les lettres du canevas
    can.delete(ALL)
    #on efface le champ de saisie
    e.delete(0, END)
    #on efface la variable mot
    mot=""
    #on créer une nouvelle Grille en appelant la fonction Grille()
    Grille()
    #on place de nouvelle lettres en appelant la fonction Place_lettrres()
    Place_lettres()



def Quitter():     # fonction servant à quitter le jeu
    global score
    print(score)
    #on remet le score à 0
    score=0
    #et bien sûr on ferme la fenêtre
    fen.destroy()

def Effacer():    #fonction servant a effacer son entrée
    global mot, Lettre
    #on efface le champ de saisie
    e.delete(0, END)
    #on efface la variable mot
    mot=""


#~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~#
#~~~~~~~~~~~~~~INTERFACE GRAPHIQUE~~~~~~~~~~~~~~~#
#~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~#

fen = Tk()
fen.title("JEU DE BOGGLE")
fen.geometry("1000x700")
fen.configure(bg="brown", cursor="arrow")

can = Canvas(fen, cursor="arrow", width="282", height="282")
can.pack(padx=10, pady=125)
#on lie le clique gauche de la souris avec la fonction selct_Mots et le tag "TXT" (les lettres)
can.tag_bind("TXT", "<Button-1>", Select_Mots)
##can.bind("<Button-1>", Cases_Adj)
##can.tag_bind("tag1", "<Button-1>", Chemins)

#la variable MOT sera affiché dans l'Entry
MOT = StringVar()
e = Entry(fen, textvariable=MOT, state='readonly',  width="55", bg="white", fg='black')
e.place(x=280, y=500)

Actual_Time = IntVar()
lbl1 = Label(fen, textvariable=Actual_Time, font=('Arial', '15'),width=20, height=3, fg='red', bg='grey')
lbl1.place(x=50, y=125)

#La variable Msg sera affichée dans le label
Msg = StringVar()
lbl2 = Label(fen, textvariable=Msg, state=DISABLED, font=('Arial', '10'),width=30, height=3, fg='black', bg='white')
lbl2.place(x=330, y=580)

#On crée et place le bouton quitter qui a pour commande la fonction Quitter()
bt1 = Button(fen, text="QUITTER", bg='grey', font=('Arial', '15'), width=15, height=2, command=Quitter)
bt1.place(x=690, y=620)
#On crée et place le bouton ajouter qui a pour commande la fonnction Ajouter()
bt2 = Button(fen, text="Ajouter", fg='white', bg='grey', font=('Arial', '5'), width=15, height=3, command=Ajouter)
bt2.place(x=645, y=495)
#On crée et place le bouton ajouter qui a pour commande la fonnction Effacer()
bt3 = Button(fen, text="Effacer", fg='white', bg='grey', font=("Arial", '5'), width=15, height=3, command=Effacer)
bt3.place(x=715, y=495)
#On crée et place le bouton ajouter qui a pour commande la fonnction Nouveau()
bt4 = Button(fen, text="Nouvelle Grille", fg='white', bg='grey', font=("Arial", '8'), width=25, height=7, command=Nouveau)
bt4.place(x=700, y=250)

#on appelle le fonction pour créer la grille
Grille()
#on appelle la fonction pour sélectionner et placer les lettres
Place_lettres()
##Cases_Adj()

fen.mainloop()
##Start_Time = time
#mixer.quit()