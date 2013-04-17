import sys
import random
 
colours = ["azure", "vert", "gules", "sable", "purpure", "argent", "or"]
partitions = ["fess", "bend", "pale"]
 
REGION = 1
COLOUR = 2
DIVISION = 3
 
termlist = [1]
 
nonTerminal = True
 
lastColour = 0
 
lastPartition = 0
 
def termMap(n):
    if n == COLOUR:
        global lastColour
        myColour = random.randint(0, len(colours)-1)
        while myColour == lastColour:
            myColour = random.randint(0, len(colours)-1)
 
        lastColour = myColour
        return colours[myColour]
 
    elif n == DIVISION:
        global lastPartition
        myPartition = random.randint(0, len(partitions)-1)
        while myPartition in [1, 2] and lastPartition in [1, 2]:
            myPartition = random.randint(0, len(partitions)-1)
 
        lastPartition = myPartition
        return "per "+partitions[myPartition]
 
    elif n == "and":
        return n
 
    else:
        print("*********ERROR**********")
 
while nonTerminal:
    nonTerminal = False
    i = 0
    while i < len(termlist):
        if termlist[i] == REGION:
            nonTerminal = True
            if random.random() > 0.9 or len(termlist) >= int(sys.argv[1]):
                #print("Colour!")
                #print("Length: %d" % len(termlist))
                #print(termlist)
                termlist[i] = COLOUR
            else:
                #print("New region!")
                #print("Length: %d" % len(termlist))
                termlist.insert(i+1, REGION)
                termlist.insert(i+1, "and")
                termlist.insert(i+1, REGION)
                termlist[i] = DIVISION
        i = i + 1
 
words = map(termMap, termlist)
 
print(" ".join(words))