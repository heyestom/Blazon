import sys
import random
 
colours = ["azure", "vert", "gules", "sable", "purpure", "argent", "or"]
partitions = ["fess", "pale","bend sinister" ]
 
COLOUR = 0
PARTITION = 1
 
def listrand(l):
    return l[random.randint(0,len(l)-1)]
 
targetdepth = int(sys.argv[1])
 
def generate(d, td):                                                            
    newnode = []
    if d >= td:                                                                
        newnode.append(COLOUR)                                                  
        newnode.append(listrand(colours))                                      
    else:                                                                      
        newnode.append(PARTITION)                                              
        newnode.append(listrand(partitions))                                    
        newnode.append(generate(d+1,td))                                        
        newnode.append(generate(d+1,td))                                        
                                                                               
    return newnode                                                              
                                                                               
def printtree(T, d):                                                            
    print("%s %s" % ("-"*d, T[1]))                                              
    if T[0] == PARTITION:                                                      
        printtree(T[2], d+1)                                                    
        printtree(T[3], d+1)
 
def makewordlist(T, A):
    if T[0] == PARTITION:
        A.append("per")
        A.append(T[1])
        makewordlist(T[2], A)
        A.append("and")  
        makewordlist(T[3], A)
    else:
        A.append(T[1])
                                                                               
mytree = generate(0, targetdepth)                                              
wordlist = []                                                                  
makewordlist(mytree, wordlist)                                                  
print(" ".join(wordlist))
