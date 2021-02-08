package org.mystic;

import com.epam.indigo.Indigo;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;

public class SimpleTest {

    Indigo indigo;

    @BeforeAll
    static void setUp() {
        indigo = new Indigo();
    }

    @Test
    public void testBasicLinearGetName() {
        assertEquals("n-hexane", StructureToNameHelpers.iupacNameFromIndigo(indigo.loadMolecule("CCCCCC")));
    }

    @Test
    public void testBasicAlkaneGetName() {
        assertEquals("3,4-dimethylhexane",
                StructureToNameHelpers.iupacNameFromIndigo(indigo.loadMolecule("CCC(C)C(C)CC")));
        assertEquals("4,4,7-trimethyl-6-propyldecane",
                StructureToNameHelpers.iupacNameFromIndigo(indigo.loadMolecule("CCCC(C)C(CCC)CC(C)(C)CCC")));
        assertEquals("2,4,4,7-tetramethyl-5-(2-methylpentan-3-yl)nonane",
                StructureToNameHelpers.iupacNameFromIndigo(indigo.loadMolecule("CCC(C)CC(C(CC)C(C)C)C(C)(C)CC(C)C")));
    }

    @Test
    public void testBasicAcyclicHydrocarbonGetName() {
        assertEquals("6-(buta-1,3-dien-2-yl)deca-1,8-diyne",
                StructureToNameHelpers.iupacNameFromIndigo(indigo.loadMolecule("CC#CCC(CCCC#C)C(=C)C=C")));
        assertEquals("5-(propan-2-ylidene)deca-1,8-diyne",
                StructureToNameHelpers.iupacNameFromIndigo(indigo.loadMolecule("CC#CCCC(CCC#C)=C(C)C")));
    }

    @Test
    public void testBasicTrivialAcyclicHydrocarbonGetName() {
        assertEquals("4-(propan-2-yl)heptane",
                StructureToNameHelpers.iupacNameFromIndigo(indigo.loadMolecule("CCCC(CCC)C(C)C")));
    }
}
